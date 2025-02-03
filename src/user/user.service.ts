import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/registerDto';
import * as crypto from 'crypto';
import 'dotenv/config';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  UpdateUserPoolClientCommand,
} from '@aws-sdk/client-cognito-identity-provider';

@Injectable()
export class UserService {
  private cognitoClient = new CognitoIdentityProviderClient({
    region: 'us-east-2',
  });

  private userPoolId = 'us-east-2_XlPMxr3EQ'; 
  private clientId = 'h3dt6hcr269lf6i582jp0405l'; 
  private clientSecret = '6kqkdjgltjo2ueu9edmatd4a49lmqlj4c541q6hnhfs7h7uthjb';

  private generateSecretHash(username: string): string {
    const message = username + this.clientId;
    return crypto
      .createHmac('sha256', this.clientSecret)
      .update(message)
      .digest('base64');
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name, lastName } = registerDto;

    try {
      await this.cognitoClient.send(
        new SignUpCommand({
          ClientId: this.clientId,
          Username: email,
          Password: password,
          SecretHash: this.generateSecretHash(email),
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'name', Value: name },
            { Name: 'family_name', Value: lastName },
          ],
        }),
      );

      return {
        message:
          'Usuario registrado en Cognito. Revisa tu correo para verificar la cuenta.',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verificationUser(email: string, code: string) {
    try {
      await this.cognitoClient.send(
        new ConfirmSignUpCommand({
          ClientId: this.clientId,
          Username: email,
          ConfirmationCode: code,
          SecretHash: this.generateSecretHash(email),
        }),
      );

      return { message: 'Usuario confirmado exitosamente.' };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al confirmar el usuario.');
    }
  }

  async login(email: string, password: string) {
    console.log(email, password);
    try {
      const response = await this.cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: this.clientId,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
            SECRET_HASH: this.generateSecretHash(email),
          },
        }),
      );

      console.log(response, "response");

      const idToken = response.AuthenticationResult?.IdToken;
      const accessToken = response.AuthenticationResult?.AccessToken;
      const refreshToken = response.AuthenticationResult?.RefreshToken;

      return {
        message: 'Inicio de sesión exitoso.',
        idToken,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error(error);
      console.log(error);
      throw new UnauthorizedException('Correo o contraseña inválidos.');
    }
  }

  async enableAuthFlow() {
    try {
      const result = await this.cognitoClient.send(
        new UpdateUserPoolClientCommand({
          UserPoolId: this.userPoolId,
          ClientId: this.clientId,
          ExplicitAuthFlows: [
            'ALLOW_USER_PASSWORD_AUTH',
            'ALLOW_REFRESH_TOKEN_AUTH',
            'ALLOW_ADMIN_USER_PASSWORD_AUTH',
            'ALLOW_CUSTOM_AUTH',
            'ALLOW_USER_SRP_AUTH',
          ],
        }),
      );
      console.log('Flujo de autenticación habilitado:', result);
      return { message: 'Flujo de autenticación habilitado correctamente.' };
    } catch (error) {
      console.error('Error al habilitar el flujo de autenticación:', error);
      throw new BadRequestException(
        'No se pudo habilitar el flujo de autenticación.',
      );
    }
  }
}
