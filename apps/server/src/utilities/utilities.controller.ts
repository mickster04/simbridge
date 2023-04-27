import { Controller, Get, Query, StreamableFile, Response, ParseIntPipe } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { contentType } from 'mime-types';
import { FileService } from './file.service';

@ApiTags('UTILITIES')
@Controller('api/v1/utility')
export class UtilityController {
    constructor(private fileService: FileService) {}

    private readonly RES_PDF = 'resources/pdfs/';

    @Get('pdf')
    @ApiResponse({
        status: 200,
        description: 'A streamed converted png image',
        type: StreamableFile,
    })
    @ApiQuery({ name: 'directoryname', type: String, required: false })
    async getPdf(
        @Query('filename') filename: string,
        @Query('pagenumber', ParseIntPipe) pagenumber: number,
        @Response({ passthrough: true }) res,
        @Query('directoryname') directoryname?: string,
    ): Promise<StreamableFile> {
        if (undefined === directoryname) {
            directoryname = this.RES_PDF;
        } else {
            directoryname = this.RES_PDF + directoryname;
        }
        const convertedPdfFile = await this.fileService.getConvertedPdfFile(`${directoryname}`, `${filename}`, pagenumber);

        res.set({
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename=out-${pagenumber}.png`,
        });

        return convertedPdfFile;
    }

    @Get('pdf/list')
    @ApiResponse({
        status: 200,
        description: 'An array of all the filenames within the pdfs folder',
        type: [String],
    })
    @ApiQuery({ name: 'directoryname', type: String, required: false })
    async getPdfFileList(@Query('directoryname') directoryname?: string) {
        if (undefined === directoryname) {
            directoryname = this.RES_PDF;
        } else {
            directoryname = this.RES_PDF + directoryname;
        }
        return this.fileService.getFilenames(`${directoryname}`);
    }

    @Get('pdf/listdir')
    @ApiResponse({
        status: 200,
        description: 'An array of all the directories within the pdfs folder',
        type: [String],
    })
    @ApiQuery({ name: 'directoryname', type: String, required: false })
    async getPdfDirList(@Query('directoryname') directoryname?: string) {
        if (undefined === directoryname) {
            directoryname = this.RES_PDF;
        } else {
            directoryname = this.RES_PDF + directoryname;
        }
        return this.fileService.getFoldernames(`${directoryname}`);
    }

    @Get('pdf/numpages')
    @ApiResponse({
        status: 200,
        description: 'Returns the number of pages in the pdf',
        type: Number,
    })
    @ApiQuery({ name: 'directoryname', type: String, required: false })
    async getNumberOfPages(@Query('filename') filename: string, @Query('directoryname') directoryname?: string): Promise<number> {
        if (undefined === directoryname) {
            directoryname = this.RES_PDF;
        } else {
            directoryname = this.RES_PDF + directoryname;
        }
        return this.fileService.getNumberOfPdfPages(`${directoryname}`, `${filename}`);
    }

    @Get('image')
    @ApiResponse({
        status: 200,
        description: 'A Streamed Image',
        type: StreamableFile,
    })
    async getImage(@Query('filename') filename: string, @Response({ passthrough: true }) res): Promise<StreamableFile> {
        return this.fileService.getFileStream('resources/images/', `${filename}`).then((file) => {
            res.set({
                'Content-Type': contentType(filename),
                'Content-Disposition': `attachment; filename=${filename}`,
            });
            return file;
        });
    }

    @Get('image/list')
    @ApiResponse({
        status: 200,
        description: 'An array of all the filenames within the images folder',
        type: [String],
    })
    async getImageFileList() {
        return this.fileService.getFilenames('resources/images/');
    }
}
