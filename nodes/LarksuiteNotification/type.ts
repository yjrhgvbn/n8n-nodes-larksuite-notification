export type CardItem = {
	id: string;
	name: string;
	version: string;
	dataInfo: any;
};

export type RobotItem = {
	id: string;
	name: string;
	type: 'bot' | 'sdk';
	appId?: string;
	appSecret?: string;
};

export interface LarksuiteNotificationApi {
	cardList: CardItem[] | string;
	robotList: RobotItem[] | string;
	defaultReceive: string;
	defaultAppId: string;
	defaultAppSecret: string;
}
