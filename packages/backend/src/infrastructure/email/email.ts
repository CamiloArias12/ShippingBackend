import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '../../config';

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

    constructor() {
        this.smtpConfigs = {
            default: config.smtp
        };
    }
    private createTransporter(configKey?: string): nodemailer.Transporter {
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
    }

    async sendMail(
        to: string,
        subject: string,
        html: string,
        attachments?: Array<{ filename: string; path: string }>
    ) {
        
        const transporter = this.createTransporter("default");
        const data=await transporter.sendMail({
            to: to,
            subject: subject,
            html: html,
            attachments: attachments
        });

    }

    private loadTemplate(templateName: string): handlebars.TemplateDelegate {
        const templatesFolderPath = path.join(__dirname, '../../../src/infrastructure/email/templates');
        const templatePath = path.join(templatesFolderPath, templateName);
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        return handlebars.compile(templateSource);
    }

    private getTemplate(templateName: string, values?: any): string {
        if (!templateName) {
            throw new Error(`Template "${templateName}" not found.`);
        }
        const template = this.loadTemplate(`${templateName}.hbs`);
        return template(values);
    }

    public async sendWelcomeEmail(to: string, name: string) {
        const html = this.getTemplate('welcome', { name: name });
        this.sendMail(to, 'Bienvenido a Coordinadora', html,null)
    }

}
