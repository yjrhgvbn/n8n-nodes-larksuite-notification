import { LarksuiteNotificationApi, CardItem, RobotItem } from './type';

export function parseCredentials(
	credentials: LarksuiteNotificationApi,
): LarksuiteNotificationApi & {
	cardList: CardItem[];
	robotList: RobotItem[];
} {
	const cardList = Array.isArray(credentials.cardList)
		? credentials.cardList
		: JSON.parse(credentials.cardList || '[]');
	const robotList = Array.isArray(credentials.robotList)
		? credentials.robotList
		: JSON.parse(credentials.robotList || '[]');
	return { ...credentials, cardList, robotList };
}
export function jsonParse<T = any>(input: string, defaultValue: T): T {
	try {
		return JSON.parse(input);
	} catch (error) {
		return defaultValue;
	}
}

export function base64ToBuffer(base64: string): Buffer {
	if (!base64) return Buffer.from([]);
	const buffer = Buffer.from(base64, 'base64');
	return buffer;
}
