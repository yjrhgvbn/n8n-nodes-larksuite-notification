import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class LarksuiteNotificationApi implements ICredentialType {
	name = 'larksuiteNotificationApi';
	displayName = 'Larksuite Notification API';

	documentationUrl = 'https://github.com/larksuite/node-sdk/blob/main/README.zh.md';

	properties: INodeProperties[] = [
		{
			displayName: '默认接收人',
			name: 'defaultReceive',
			type: 'string',
			default: '',
		},
		{
			displayName: '默认 App ID',
			name: 'defaultAppId',
			type: 'string',
			default: '',
		},
		{
			displayName: '默认 App Secret',
			name: 'defaultAppSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName: '卡片列表',
			name: 'cardList',
			type: 'json',
			default: '[]',
		},
		{
			displayName: '机器人列表',
			name: 'robotList',
			type: 'json',
			default: '[]',
		},
	];
}
