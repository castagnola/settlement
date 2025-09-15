import { expect, it, describe } from '@jest/globals';
import fs from 'fs';
import { join } from 'path';
import { CatalogsService } from './catalogs.service';

describe('validate Cities Service', () => {
    const service = new CatalogsService();
    it('should return an array of use', async () => {
        const result = await service.getCatalogList('optionsList');
        expect(result).toBeDefined();
    });

    it('should parse the JSON correctly', async () => {
        const result = await service.getCatalogList('optionsList');
        expect(result).toEqual(
            JSON.parse(
                await fs.promises.readFile(
                    join('src', 'datajson/optionsList.json'),
                    'utf-8'
                )
            )
        );
    });
});