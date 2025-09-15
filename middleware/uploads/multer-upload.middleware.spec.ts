import { v4 as uuid } from 'uuid';
import { describe, expect, it } from '@jest/globals';
import multer from 'multer';
import path from 'path';

const pathCsv = path.resolve(__dirname, '../../../uploads');

describe('Multer Disk Storage', () => {
	it('Should create storage object with correct properties', () => {
		const storage: any = multer.diskStorage({
			destination: function (req, file, cb) {
				cb(null, pathCsv);
			},
			filename: function (req, file, cb) {
				cb(null, `${uuid()}.csv`);
			},
		});

		expect(storage).toBeDefined();
		expect(storage.destination).toEqual(undefined);
		expect(storage.destination).toEqual(undefined);
		expect(storage.filename).toEqual(undefined);
		expect(storage.filename).toEqual(undefined);
	});
});
