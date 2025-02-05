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
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminSetUserMFAPreferenceCommand,
  RespondToAuthChallengeCommand
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

  async register(registerDto: RegisterDto, groupName: string) {
    const { email, password, name, lastName } = registerDto;
  
    try {
      await this.createUserWithMFA(
        email,
        password,
        name,
        lastName,
        '+18095555555', 
        groupName,
      );
  
      return {
        message: `Usuario registrado en el grupo ${groupName} con MFA habilitado.`,
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

  async addUserToGroup(email: string, groupName: string) {
    try {
      const command = new AdminAddUserToGroupCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        GroupName: groupName,
      });
  
      await this.cognitoClient.send(command);
      return { message: `Usuario agregado al grupo ${groupName}.` };
    } catch (error) {
      console.error('Error al agregar al usuario al grupo:', error);
      throw new BadRequestException(
        `No se pudo agregar al usuario al grupo ${groupName}.`,
      );
    }
  }

  async createUserWithMFA(email: string, password: string, name: string, lastName: string, phoneNumber: string, groupName: string) {
    try {

      const createUserCommand = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: name },
          { Name: 'family_name', Value: lastName },
          { Name: 'phone_number', Value: phoneNumber },
        ],
        TemporaryPassword: password,
      });
      await this.cognitoClient.send(createUserCommand);
      
      const enableMFACommand = new AdminSetUserMFAPreferenceCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        SMSMfaSettings: {
          Enabled: true,
          PreferredMfa: true,
        },
      });
      await this.cognitoClient.send(enableMFACommand);
  
      await this.addUserToGroup(email, groupName);
  
      return { message: 'Usuario creado con MFA y asignado a un grupo.' };
    } catch (error) {
      console.error('Error al crear usuario con MFA:', error);
      throw new BadRequestException('No se pudo crear el usuario con MFA.');
    }
  }
  
  async respondToMFAChallenge(session: string, mfaCode: string, email: string) {
    try {
      const response = await this.cognitoClient.send(
        new RespondToAuthChallengeCommand({
          ClientId: this.clientId,
          ChallengeName: 'SMS_MFA',
          Session: session,
          ChallengeResponses: {
            USERNAME: email,
            SMS_MFA_CODE: mfaCode,
          },
        }),
      );
  
      return {
        message: 'Autenticación MFA completada.',
        tokens: response.AuthenticationResult,
      };
    } catch (error) {
      console.error('Error al completar MFA:', error);
      throw new UnauthorizedException('Error en la autenticación MFA.');
    }
  }
  
  

}
