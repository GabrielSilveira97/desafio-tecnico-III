import { Routes } from '@angular/router';
import { PacientesListComponent } from './features/pacientes/components/pacientes/pacientes';
import { ExamesListComponent } from './features/exames/component/exames/exames';
import { ExameService } from './features/exames/services/exame.service';
export const routes: Routes = [    
    {
        path: '',
        redirectTo: 'pacientes',
        pathMatch: 'full'
    },
    {
        path: 'pacientes',
        component : PacientesListComponent,
        
    },
    {
        path: 'exames',
        component : ExamesListComponent,
        providers: [ExameService]
    }
];
