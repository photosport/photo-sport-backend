import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import * as AWS from 'aws-sdk';
import { config } from 'dotenv';

config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
@ApiTags('Subida')
@Controller('subida')
export class SubidaController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No se ha enviado ningún archivo', HttpStatus.BAD_REQUEST);
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    
    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private', 
    };

    try {
      await s3.upload(uploadParams).promise();
    } catch (error) {
      console.error('Error al subir archivo a S3:', error);
      throw new HttpException(
        'Error al subir el archivo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let signedUrl: string;
    try {
      signedUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Expires: parseInt(process.env.SIGNED_URL_EXPIRES, 10) || 900,
      });
    } catch (error) {
      console.error('Error al generar URL firmada:', error);
      throw new HttpException(
        'Error al generar la URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: 'Archivo subido correctamente',
      url: signedUrl,
    };
  }
}

