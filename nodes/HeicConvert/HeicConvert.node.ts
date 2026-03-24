import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

const convert = require('heic-convert');

export class HeicConvert implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HEIC Convert',
		name: 'heicConvert',
		icon: 'file:icon.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["outputFormat"]}}',
		description: 'HEIC/HEIF 图片转换为 PNG 或 JPEG 格式',
		defaults: {
			name: 'HEIC Convert',
		},
		usableAsTool: undefined,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				description: '包含 HEIC/HEIF 图片的二进制字段名称',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'JPEG',
						value: 'JPEG',
					},
					{
						name: 'PNG',
						value: 'PNG',
					},
				],
				default: 'JPEG',
				description: '输出图片格式',
			},
			{
				displayName: 'Quality',
				name: 'quality',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.01,
				},
				default: 0.92,
				displayOptions: {
					show: {
						outputFormat: ['JPEG'],
					},
				},
				description: 'JPEG 压缩质量，范围 0-1，1 为最高质量',
			},
			{
				displayName: 'Output Binary Field',
				name: 'outputBinaryPropertyName',
				type: 'string',
				default: 'data',
				description: '输出二进制字段名称',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const binaryPropertyName = this.getNodeParameter(
					'binaryPropertyName',
					itemIndex,
				) as string;
				const outputFormat = this.getNodeParameter('outputFormat', itemIndex) as string;
				const outputBinaryPropertyName = this.getNodeParameter(
					'outputBinaryPropertyName',
					itemIndex,
				) as string;

				const item = items[itemIndex];

				if (!item.binary) {
					throw new NodeOperationError(this.getNode(), '输入数据中没有二进制数据', {
						itemIndex,
					});
				}

				if (!item.binary[binaryPropertyName]) {
					throw new NodeOperationError(
						this.getNode(),
						`二进制字段 "${binaryPropertyName}" 不存在`,
						{ itemIndex },
					);
				}

				const inputBuffer = await this.helpers.getBinaryDataBuffer(
					itemIndex,
					binaryPropertyName,
				);

				const convertOptions: { buffer: Buffer; format: string; quality?: number } = {
					buffer: inputBuffer,
					format: outputFormat,
				};

				if (outputFormat === 'JPEG') {
					const quality = this.getNodeParameter('quality', itemIndex) as number;
					convertOptions.quality = quality;
				}

				const outputBuffer = await convert(convertOptions);

				const originalFileName =
					item.binary[binaryPropertyName].fileName || 'converted';
				const baseName = originalFileName.replace(/\.[^.]+$/, '');
				const extension = outputFormat === 'JPEG' ? 'jpg' : 'png';
				const mimeType = outputFormat === 'JPEG' ? 'image/jpeg' : 'image/png';
				const newFileName = `${baseName}.${extension}`;

				const binaryData = await this.helpers.prepareBinaryData(
					Buffer.from(outputBuffer),
					newFileName,
					mimeType,
				);

				const newItem: INodeExecutionData = {
					json: { ...item.json },
					binary: {
						[outputBinaryPropertyName]: binaryData,
					},
					pairedItem: { item: itemIndex },
				};

				returnData.push(newItem);
			} catch (error) {
				if (this.continueOnFail()) {
					const item = items[itemIndex];
					returnData.push({
						json: {
							...item.json,
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
