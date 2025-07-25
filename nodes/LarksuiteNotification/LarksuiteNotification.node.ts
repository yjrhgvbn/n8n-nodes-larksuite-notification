import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { listSearch } from './methods';
import { LarksuiteNotificationApi } from './type';
import { jsonParse, parseCredentials } from './utils';
import * as lark from '@larksuiteoapi/node-sdk';
import { pinMessage, sendPost, uploadImg, urgentMessage } from './api';

export class LarksuiteNotification implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Larksuite Notification',
		name: 'larksuiteNotification',
		group: ['transform'],
		version: 1,
		description: 'Larksuite Notification Node',
		defaults: {
			name: 'Larksuite Notification',
		},
		credentials: [
			{
				name: 'larksuiteNotificationApi',
				required: true,
			},
		],
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: '卡片类型',
				name: 'cardList',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'cardSearch',
						},
					},
				],
			},
			{
				displayName: '机器人',
				name: 'robotList',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'robotSearch',
						},
					},
				],
			},
			{
				displayName: '变量',
				name: 'variables',
				type: 'json',
				default: '',
			},
			{
				displayName: '图片列表',
				name: 'imageList',
				type: 'json',
				default: '',
			},
			{
				displayName: '信息类型',
				name: 'messageType',
				type: 'options',
				default: 'normal',
				options: [
					{
						name: '普通消息',
						value: 'normal',
					},
					{
						name: '加急消息',
						value: 'urgent',
					},
					{
						name: 'Pine',
						value: 'pine',
					},
				],
			},
			{
				displayName: '接收人',
				name: 'receive',
				type: 'string',
				default: '',
				description: '接收人，默认取凭证中的ID',
			},
		],
	};

	methods = { listSearch };
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const cardType = this.getNodeParameter('cardList', 0) as any;
		const robot = this.getNodeParameter('robotList', 0) as any;
		const variables = jsonParse(this.getNodeParameter('variables', 0, '{}') as string, {}) as any;
		const imageList = jsonParse(this.getNodeParameter('imageList', 0, '[]') as string, []);
		const messageType = this.getNodeParameter('messageType', 0) as string;
		const receive = this.getNodeParameter('receive', 0, '') as string;
		const credentials = await this.getCredentials<LarksuiteNotificationApi>(
			'larksuiteNotificationApi',
		);
		const { cardList, robotList, defaultReceive, defaultAppId, defaultAppSecret } =
			parseCredentials(credentials);
		const matchedCard = cardList.find((card) => card.id === cardType.value);
		const matchedRobot = robotList.find((robotItem) => robotItem.id === robot.value);
		if (!matchedCard || !matchedRobot) {
			throw new NodeOperationError(this.getNode(), 'Card or Robot not found');
		}
		if (matchedRobot.type === 'sdk') {
			if (!matchedRobot.appId || !matchedRobot.appSecret) {
				throw new NodeOperationError(
					this.getNode(),
					'App ID and App Secret are required for SDK type robots',
				);
			}
			const client = new lark.Client({
				appId: matchedRobot.appId || defaultAppId,
				appSecret: matchedRobot.appSecret || defaultAppSecret,
				disableTokenCache: false,
			});
			if (imageList.length > 0) {
				const imgKeys = await Promise.all(imageList.map((img) => uploadImg(client, img)));
				variables.imgList = imgKeys.map((key) => ({
					img: {
						img_key: key,
					},
				}));
			}
			const sendRes = await sendPost(client, matchedCard, receive || defaultReceive, variables);
			if (messageType === 'urgent') {
				await urgentMessage(client, sendRes.data?.message_id, receive || defaultReceive);
			}
			if (messageType === 'pine') {
				await pinMessage(client, sendRes.data?.message_id);
			}
			return [[{json:sendRes}]];
		} else if (matchedRobot.type === 'bot') {
			if (imageList.length > 0) {
				const client = new lark.Client({
					appId: matchedRobot.appId || defaultAppId,
					appSecret: matchedRobot.appSecret || defaultAppSecret,
					disableTokenCache: false,
				});
				const imgKeys = await Promise.all(imageList.map((img) => uploadImg(client, img)));
				variables.imgList = imgKeys.map((key) => ({
					img: {
						img_key: key,
					},
				}));
			}
			const res = await fetch(`https://open.feishu.cn/open-apis/bot/v2/hook/${matchedRobot.id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					msg_type: 'interactive',
					card: {
						type: 'template',
						data: {
							template_id: matchedCard.id,
							template_version_name: matchedCard.version,
							template_variable: variables,
						},
					},
				}),
			});
			const data = await res.json();
			if (data.code !== 0) {
				throw new NodeOperationError(this.getNode(), `Error sending message: ${data.msg}`);
			}
			return [[{json:data}]];
		} else {
			throw new NodeOperationError(this.getNode(), `Unsupported robot type: ${matchedRobot.type}`);
		}
	}
}
