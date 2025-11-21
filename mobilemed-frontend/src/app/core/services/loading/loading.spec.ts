import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService]
    });
    service = TestBed.inject(LoadingService);
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  describe('show - Mostrar loading', () => {
    it('deve ativar o estado de loading', (done) => {
      service.show();

      service.loading$.subscribe(isLoading => {
        if (isLoading) {
          expect(isLoading).toBe(true);
          done();
        }
      });
    });

    it('deve emitir valor true quando show() é chamado', (done) => {
      let emissionCount = 0;
      
      service.loading$.subscribe(isLoading => {
        if (emissionCount === 1 && isLoading) {
          expect(isLoading).toBe(true);
          done();
        }
        emissionCount++;
      });

      service.show();
    });
  });

  describe('hide - Esconder loading', () => {
    it('deve desativar o estado de loading', (done) => {
      service.show();
      let hideEmitted = false;
      
      service.loading$.subscribe(isLoading => {
        if (!isLoading && !hideEmitted) {
          hideEmitted = true;
          expect(isLoading).toBe(false);
          done();
        }
      });
      
      setTimeout(() => {
        service.hide();
      }, 10);
    });

    it('deve emitir valor false quando hide() é chamado', (done) => {
      let emissions: boolean[] = [];
      
      service.loading$.subscribe(val => emissions.push(val));
      
      service.show();
      
      setTimeout(() => {
        service.hide();
        setTimeout(() => {
          const hasFalse = emissions.some((val, idx) => idx > 0 && !val);
          expect(hasFalse).toBe(true);
          done();
        }, 50);
      }, 10);
    }, 10000);  // Increase timeout for this async test
  });

  describe('loading$ - Observable', () => {
    it('deve iniciar com valor false', (done) => {
      service.loading$.subscribe(isLoading => {
        expect(isLoading).toBe(false);
        done();
      });
    });

    it('deve permitir múltiplos subscribers', (done) => {
      let subscriber1Value: boolean | undefined;
      let subscriber2Value: boolean | undefined;

      service.loading$.subscribe(val => subscriber1Value = val);
      service.loading$.subscribe(val => subscriber2Value = val);

      service.show();

      setTimeout(() => {
        expect(subscriber1Value).toBe(true);
        expect(subscriber2Value).toBe(true);
        done();
      }, 50);
    });
  });

  describe('Sequência de show/hide', () => {
    it('deve alternar entre true e false corretamente', (done) => {
      const states: boolean[] = [];

      service.loading$.subscribe(val => states.push(val));

      service.show();
      setTimeout(() => service.hide(), 10);
      setTimeout(() => service.show(), 20);
      setTimeout(() => {
        expect(states[0]).toBe(false); // inicial
        expect(states[1]).toBe(true);  // após show()
        expect(states[2]).toBe(false); // após hide()
        expect(states[3]).toBe(true);  // após show()
        done();
      }, 50);
    });
  });
});
