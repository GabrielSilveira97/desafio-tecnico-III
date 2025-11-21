import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService]
    });
    service = TestBed.inject(NotificationService);
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  describe('success - Notificação de sucesso', () => {
    it('deve emitir notificação de sucesso', (done) => {
      const message = 'Operação realizada com sucesso';

      service.notification$.subscribe((notification: any) => {
        if (notification) {
          expect(notification.message).toBe(message);
          expect(notification.type).toBe('success');
          expect(notification.duration).toBe(3000);
          done();
        }
      });

      service.success(message);
    });

    it('deve aceitar duração customizada', (done) => {
      const message = 'Sucesso';
      const duration = 5000;

      service.notification$.subscribe((notification: any) => {
        if (notification) {
          expect(notification.duration).toBe(duration);
          done();
        }
      });

      service.success(message, duration);
    });
  });

  describe('error - Notificação de erro', () => {
    it('deve emitir notificação de erro', (done) => {
      const message = 'Erro ao processar';

      service.notification$.subscribe((notification: any) => {
        if (notification) {
          expect(notification.message).toBe(message);
          expect(notification.type).toBe('error');
          expect(notification.duration).toBe(5000);
          done();
        }
      });

      service.error(message);
    });

    it('deve aceitar duração customizada para erro', (done) => {
      const duration = 7000;

      service.notification$.subscribe((notification: any) => {
        if (notification) {
          expect(notification.duration).toBe(duration);
          done();
        }
      });

      service.error('Erro', duration);
    });
  });

  describe('info - Notificação informativa', () => {
    it('deve emitir notificação de informação', (done) => {
      const message = 'Informação importante';

      service.notification$.subscribe((notification: any) => {
        if (notification) {
          expect(notification.message).toBe(message);
          expect(notification.type).toBe('info');
          expect(notification.duration).toBe(3000);
          done();
        }
      });

      service.info(message);
    });
  });

  describe('warning - Notificação de aviso', () => {
    it('deve emitir notificação de aviso', (done) => {
      const message = 'Cuidado com esta operação';

      service.notification$.subscribe((notification: any) => {
        if (notification) {
          expect(notification.message).toBe(message);
          expect(notification.type).toBe('warning');
          expect(notification.duration).toBe(4000);
          done();
        }
      });

      service.warning(message);
    });
  });

  describe('notification$ - Observable', () => {
    it('deve emitir notificações para múltiplos subscribers', (done) => {
      let count = 0;

      service.notification$.subscribe((notification: any) => {
        if (notification) count++;
      });

      service.notification$.subscribe((notification: any) => {
        if (notification && count >= 1) {
          expect(count).toBe(1);
          done();
        }
      });

      service.success('Teste');
    });
  });

  describe('Sequência de notificações', () => {
    it('deve permitir múltiplas notificações em sequência', (done) => {
      const notifications: any[] = [];

      service.notification$.subscribe((notification: any) => {
        if (notification) {
          notifications.push(notification);
        }
      });

      service.success('Primeiro');
      service.error('Segundo');
      service.info('Terceiro');

      setTimeout(() => {
        expect(notifications.length).toBe(3);
        expect(notifications[0].type).toBe('success');
        expect(notifications[1].type).toBe('error');
        expect(notifications[2].type).toBe('info');
        done();
      }, 100);
    });
  });

  describe('Durações padrão', () => {
    it('success deve ter duração padrão de 3000ms', (done) => {
      service.notification$.subscribe((notification: any) => {
        if (notification && notification.type === 'success') {
          expect(notification.duration).toBe(3000);
          done();
        }
      });

      service.success('Mensagem');
    });

    it('error deve ter duração padrão de 5000ms', (done) => {
      service.notification$.subscribe((notification: any) => {
        if (notification && notification.type === 'error') {
          expect(notification.duration).toBe(5000);
          done();
        }
      });

      service.error('Erro');
    });

    it('info deve ter duração padrão de 3000ms', (done) => {
      service.notification$.subscribe((notification: any) => {
        if (notification && notification.type === 'info') {
          expect(notification.duration).toBe(3000);
          done();
        }
      });

      service.info('Info');
    });

    it('warning deve ter duração padrão de 4000ms', (done) => {
      service.notification$.subscribe((notification: any) => {
        if (notification && notification.type === 'warning') {
          expect(notification.duration).toBe(4000);
          done();
        }
      });

      service.warning('Aviso');
    });
  });
});
