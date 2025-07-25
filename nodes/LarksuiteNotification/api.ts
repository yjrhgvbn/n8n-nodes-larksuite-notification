import * as lark from '@larksuiteoapi/node-sdk';
import { base64ToBuffer } from './utils';
import { CardItem } from './type';
import { Readable } from 'stream';

export function uploadImg(client: lark.Client, img: string): Promise<string> {
	const buffer = base64ToBuffer(img);
	return client.im.v1.image
		.create(
			{
				data: {
					image_type: 'message',
					image: Readable.from(buffer) as any,
				},
			},
			lark.withTenantToken(''),
		)
		.then((res) => {
			return res?.image_key || '';
		})
		.catch((e) => {
			return '';
		});
}

export function sendPost(
	client: lark.Client,
	card: CardItem,
	receive: string,
	variables: any,
): Promise<any> {
	const postData = {
		type: 'template',
		data: {
			template_id: card.id,
			template_version_name: card.version,
			template_variable: variables,
		},
	};
	return client.im.v1.message
		.create({
			params: {
				receive_id_type: 'open_id',
			},
			data: {
				receive_id: receive,
				msg_type: 'interactive',
				content: JSON.stringify(postData),
			},
		})
		.catch((e) => {
			return JSON.stringify(e.response.data, null, 4);
		});
}

export function urgentMessage(
	client: lark.Client,
	message_id: string,
	receive: string,
): Promise<any> {
	return client.im.v1.message
		.urgentApp({
			path: {
				message_id: message_id,
			},
			params: {
				user_id_type: 'open_id',
			},
			data: {
				user_id_list: [receive],
			},
		})
		.catch((e) => {
			return JSON.stringify(e.response.data, null, 4);
		});
}

export function pinMessage(client: lark.Client, message_id: string): Promise<any> {
	return client.im.v1.pin.create({
		data: {
			message_id,
		},
	});
}
