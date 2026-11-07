import { describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import { ContactService } from '../src/modules/contact/contact.service';
import type { AuthRateLimitService } from '../src/modules/auth/auth-rate-limit.service';

function setup(inbox: string | undefined, send = vi.fn().mockResolvedValue(undefined)) {
  const consume = vi.fn().mockResolvedValue(undefined);
  const config = { get: () => inbox } as unknown as ConfigService;
  const service = new ContactService({ consume } as unknown as AuthRateLimitService, { send }, config);
  return { service, send, consume };
}

const message = { name: 'Ana <b>Silva</b>', email: 'ana@example.pt', message: 'Gostaria de saber mais sobre a ISO 9001.' };

describe('ContactService', () => {
  it('sends the message to the inbox with the visitor as reply-to, escaping HTML', async () => {
    const { service, send, consume } = setup('equipa@example.pt');
    await service.send(message, '203.0.113.1');
    expect(consume).toHaveBeenCalledWith('contact', '203.0.113.1', 'ana@example.pt', 3, 3600);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'equipa@example.pt', replyTo: 'ana@example.pt' }));
    expect(send.mock.calls[0][0].html).toContain('Ana &lt;b&gt;Silva&lt;/b&gt;');
  });

  it('reports messaging as unavailable without an inbox or when delivery fails', async () => {
    expect(setup(undefined).service.isAvailable()).toBe(false);
    await expect(setup(undefined).service.send(message, undefined)).rejects.toMatchObject({
      response: { error: { code: 'CONTACT_UNAVAILABLE' } },
    });
    await expect(setup('equipa@example.pt', vi.fn().mockRejectedValue(new Error('down'))).service.send(message, undefined))
      .rejects.toMatchObject({ response: { error: { code: 'CONTACT_UNAVAILABLE' } } });
  });

  it('accepts honeypot submissions silently without sending them', async () => {
    const { service, send } = setup('equipa@example.pt');
    await service.send({ ...message, website: 'https://spam.example' }, undefined);
    expect(send).not.toHaveBeenCalled();
  });

  it('keeps line breaks out of the subject', async () => {
    const { service, send } = setup('equipa@example.pt');
    await service.send({ ...message, name: 'Ana\r\nBcc: x@example.com' }, undefined);
    expect(send.mock.calls[0][0].subject).toBe('Contacto pelo site: Ana Bcc: x@example.com');
  });
});
