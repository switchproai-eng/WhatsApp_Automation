// WhatsApp Cloud API Service
const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
}

export interface TextMessage {
  to: string;
  text: string;
}

export interface TemplateMessage {
  to: string;
  templateName: string;
  languageCode: string;
  components?: TemplateComponent[];
}

export interface TemplateComponent {
  type: "header" | "body" | "button";
  parameters: TemplateParameter[];
}

export interface TemplateParameter {
  type: "text" | "image" | "document" | "video";
  text?: string;
  image?: { link: string };
  document?: { link: string; filename: string };
  video?: { link: string };
}

export interface InteractiveMessage {
  to: string;
  type: "button" | "list";
  header?: {
    type: "text" | "image" | "video" | "document";
    text?: string;
    image?: { link: string };
  };
  body: string;
  footer?: string;
  buttons?: Array<{
    id: string;
    title: string;
  }>;
  sections?: Array<{
    title: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
}

export interface MediaMessage {
  to: string;
  type: "image" | "document" | "audio" | "video";
  mediaUrl: string;
  caption?: string;
  filename?: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  private async sendRequest(endpoint: string, body: object): Promise<{ messageId: string }> {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${this.config.phoneNumberId}/${endpoint}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API Error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return { messageId: data.messages?.[0]?.id };
  }

  async sendTextMessage(message: TextMessage): Promise<{ messageId: string }> {
    return this.sendRequest("messages", {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: message.to,
      type: "text",
      text: {
        preview_url: true,
        body: message.text,
      },
    });
  }

  async sendTemplateMessage(message: TemplateMessage): Promise<{ messageId: string }> {
    const body: Record<string, unknown> = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: message.to,
      type: "template",
      template: {
        name: message.templateName,
        language: {
          code: message.languageCode,
        },
      },
    };

    if (message.components && message.components.length > 0) {
      (body.template as Record<string, unknown>).components = message.components;
    }

    return this.sendRequest("messages", body);
  }

  async sendInteractiveMessage(message: InteractiveMessage): Promise<{ messageId: string }> {
    const interactive: Record<string, unknown> = {
      type: message.type,
      body: {
        text: message.body,
      },
    };

    if (message.header) {
      interactive.header = message.header;
    }

    if (message.footer) {
      interactive.footer = { text: message.footer };
    }

    if (message.type === "button" && message.buttons) {
      interactive.action = {
        buttons: message.buttons.map((btn) => ({
          type: "reply",
          reply: {
            id: btn.id,
            title: btn.title,
          },
        })),
      };
    }

    if (message.type === "list" && message.sections) {
      interactive.action = {
        button: "View Options",
        sections: message.sections,
      };
    }

    return this.sendRequest("messages", {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: message.to,
      type: "interactive",
      interactive,
    });
  }

  async sendMediaMessage(message: MediaMessage): Promise<{ messageId: string }> {
    const mediaObject: Record<string, unknown> = {
      link: message.mediaUrl,
    };

    if (message.caption) {
      mediaObject.caption = message.caption;
    }

    if (message.type === "document" && message.filename) {
      mediaObject.filename = message.filename;
    }

    return this.sendRequest("messages", {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: message.to,
      type: message.type,
      [message.type]: mediaObject,
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.sendRequest("messages", {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    });
  }

  async getMediaUrl(mediaId: string): Promise<string> {
    const response = await fetch(`${WHATSAPP_API_URL}/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get media URL");
    }

    const data = await response.json();
    return data.url;
  }

  async downloadMedia(mediaUrl: string): Promise<Buffer> {
    const response = await fetch(mediaUrl, {
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download media");
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

// Helper to create WhatsApp service from tenant settings
export async function createWhatsAppService(
  phoneNumberId: string,
  accessToken: string
): Promise<WhatsAppService> {
  return new WhatsAppService({
    phoneNumberId,
    accessToken,
  });
}
