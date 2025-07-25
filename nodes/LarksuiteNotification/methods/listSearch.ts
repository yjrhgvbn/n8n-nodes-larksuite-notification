import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { CardItem, LarksuiteNotificationApi, RobotItem } from '../type';

export async function cardSearch(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
	const credentials = await this.getCredentials<LarksuiteNotificationApi>(
		'larksuiteNotificationApi',
	);
	let cardList = credentials.cardList || [];
	if (typeof cardList === 'string') {
		try {
			cardList = JSON.parse(cardList) as CardItem[];
		} catch (error) {
			cardList = [];
		}
	}
	return {
		results: cardList.map((card) => ({
			name: card.name as string,
			value: card.id as string,
		})),
	};
}
export async function robotSearch(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
	const credentials = await this.getCredentials<LarksuiteNotificationApi>(
		'larksuiteNotificationApi',
	);
	let robotList = credentials.robotList || [];
	if (typeof robotList === 'string') {
		try {
			robotList = JSON.parse(robotList) as RobotItem[];
		} catch (error) {
			robotList = [];
		}
	}
	return {
		results: robotList.map((robot) => ({
			name: robot.name as string,
			value: robot.id as string,
		})),
	};
}
