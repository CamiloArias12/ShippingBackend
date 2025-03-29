import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '../../config';
import { Logger } from '../../utils/Logger';

export type SMTPConfig = {
    host: string;
    port: number;
    secure: boolean;
    name: string;
    auth: {
        user: string;
        pass: string;
    };
    from: string;
};


export class MailerService {
    private smtpConfigs: Record<string, SMTPConfig>;
    private logger :Logger

    constructor(logger:Logger) {
        this.smtpConfigs = {
            default: config.smtp
        };
        this.logger = logger;
    }

    private createTransporter(configKey?: string): nodemailer.Transporter {
        try {
            const config = this.smtpConfigs[configKey || 'default'];
            if (!config) {
                throw new Error(`SMTP configuration "${configKey}" not found.`);
            }
    
            return nodemailer.createTransport({
                host: config.host,
                port: config.port,
                name: config.name,
                secure: config.secure,
                auth: {
                    user: config.auth.user,
                    pass: config.auth.pass
                }
            }, { from: config.auth.user });
        }catch(e){
            this.logger.error(`[MailerService](createTransporter): Error creating transporter for config "${configKey}"`, e);
            throw e;
        }
        
    }

    async sendMail(
        to: string,
        subject: string,
        html: string,
        attachments?: Array<{ filename: string; path: string }>
    ) {
        try {
            const transporter = this.createTransporter("default");
            await transporter.sendMail({
                to: to,
                subject: subject,
                html: html,
                attachments: attachments
            });
        } catch (e) {
            this.logger.error(`[MailerService](sendMail): Error sending email`, e);
            throw e;
        }
    }

    private loadTemplate(templateName: string): handlebars.TemplateDelegate {
        try {
            const templatesFolderPath = path.join(__dirname, '../../../src/infrastructure/email/templates');
            const templatePath = path.join(templatesFolderPath, templateName);
            const templateSource = fs.readFileSync(templatePath, 'utf8');
            return handlebars.compile(templateSource);
        } catch (e) {
            this.logger.error(`[MailerService](loadTemplate): Error loading template "${templateName}"`, e);
            throw e;
        }
    }

    private getTemplate(templateName: string, values?: any): string {
        try {
            if (!templateName) {
                throw new Error(`Template "${templateName}" not found.`);
            }
            const template = this.loadTemplate(`${templateName}.hbs`);
            return template(values);
        } catch (e) {
            this.logger.error(`[MailerService](getTemplate): Error getting template "${templateName}"`, e);
            throw e;
        }

    }

    public async sendWelcomeEmail(to: string, name: string) {
        try {
            const html = this.getTemplate('welcome', { name: name });
            await this.sendMail(to, 'Bienvenido a Coordinadora', html, null)
        } catch (e) {
            this.logger.error(`[MailerService](sendWelcomeEmail): Error sending welcome email`, e);
            console.error(e);
        }
    }

}
