import { Component, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrainService } from '../shared/train.service';
import { AnimateOnScrollDirective } from '../shared/directives/animate-on-scroll.directive';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, FormsModule, AnimateOnScrollDirective],
    templateUrl: './home.component.html',
    styles: [`
    /* Special "Train Loop" Background Animation */
    @keyframes moveTrain {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    .train-animation {
       animation: moveTrain 20s linear infinite;
    }
  `]
})
export class HomeComponent implements OnInit {
    activeTab = signal<'search' | 'pnr'>('search');
    stations = signal<string[]>([]);

    // Autocomplete State
    filteredFromStations: string[] = [];
    filteredToStations: string[] = [];
    showFromSuggestions = false;
    showToSuggestions = false;

    constructor(private router: Router, private trainService: TrainService) { }

    ngOnInit() {
        this.trainService.getStations().subscribe(data => {
            this.stations.set(data);
        });
    }

    // Search Form Models
    fromStation = '';
    toStation = '';
    travelDate = '';
    pnrNumber = '';
    errorMessage = '';

    // Field-level Validation Errors
    fromError = '';
    toError = '';
    dateError = '';

    minDate: string = new Date().toISOString().split('T')[0];

    popularRoutes = [
        {
            name: 'Surat to Ujjain', from: 'Surat', to: 'Ujjain', img: 'images/ujjain.png', duration: '9h 37m', price: '₹494',
            tag: 'Cultural Capital', rating: 4.9, trainType: 'Avantika Exp'
        },
        {
            name: 'Surat to Mumbai', from: 'Surat', to: 'Mumbai', img: 'images/mumbai.png', duration: '3h 50m', price: '₹364',
            tag: 'Fastest Route', rating: 4.8, trainType: 'Avantika Exp'
        },
        {
            name: 'Surat to Dwarka', from: 'Surat', to: 'Dwarka', img: 'images/dwarka.png', duration: '5h 57m', price: '₹368',
            tag: 'Religious Hub', rating: 4.7, trainType: 'Express'
        }
    ];

    toggleTab(tab: 'search' | 'pnr') {
        this.activeTab.set(tab);
    }

    // Autocomplete Logic
    filterStations(type: 'from' | 'to') {
        const query = type === 'from' ? this.fromStation : this.toStation;

        // Clear specific error
        if (type === 'from') this.fromError = '';
        if (type === 'to') this.toError = '';
        this.errorMessage = '';

        if (!query) {
            if (type === 'from') {
                this.filteredFromStations = [];
                this.showFromSuggestions = false;
            } else {
                this.filteredToStations = [];
                this.showToSuggestions = false;
            }
            return;
        }

        const filtered = this.stations().filter(s => s.toLowerCase().includes(query.toLowerCase()));

        if (type === 'from') {
            this.filteredFromStations = filtered;
            this.showFromSuggestions = true;
        } else {
            this.filteredToStations = filtered;
            this.showToSuggestions = true;
        }
    }

    selectStation(station: string, type: 'from' | 'to') {
        if (type === 'from') {
            this.fromStation = station;
            this.fromError = ''; // Clear error on selection
            this.showFromSuggestions = false;
        } else {
            this.toStation = station;
            this.toError = ''; // Clear error on selection
            this.showToSuggestions = false;
        }
    }

    // Close suggestions if clicked outside
    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.group')) { // Assuming 'group' class wraps the input container
            this.showFromSuggestions = false;
            this.showToSuggestions = false;
        }
    }

    onSearch() {
        console.log('onSearch called. Params:', { from: this.fromStation, to: this.toStation, date: this.travelDate });

        // Reset errors
        this.fromError = '';
        this.toError = '';
        this.dateError = '';
        this.errorMessage = '';

        let hasError = false;

        if (!this.fromStation) {
            this.fromError = 'Please select Departure';
            hasError = true;
        }
        if (!this.toStation) {
            this.toError = 'Please select Destination';
            hasError = true;
        }
        if (!this.travelDate) {
            this.dateError = 'Please select Date';
            hasError = true;
        }

        if (hasError) {
            return;
        }

        if (this.fromStation.toLowerCase() === this.toStation.toLowerCase()) {
            this.errorMessage = 'Please select valid value';
            return;
        }

        this.router.navigate(['/search-results'], {
            queryParams: {
                from: this.fromStation,
                to: this.toStation,
                date: this.travelDate
            }
        }).then(success => {
            console.log('Navigation success:', success);
            if (!success) {
                console.error('Navigation failed');
                this.errorMessage = 'Navigation failed. Please try again.';
            }
        }).catch(err => {
            console.error('Navigation error:', err);
            this.errorMessage = 'Navigation error: ' + err;
        });
    }

    swapStations() {
        const temp = this.fromStation;
        this.fromStation = this.toStation;
        this.toStation = temp;
    }

    bookRoute(route: any) {
        this.router.navigate(['/search-results'], {
            queryParams: {
                from: route.from,
                to: route.to,
                date: new Date().toISOString().split('T')[0] // Default to today
            }
        });
    }

    onCheckPnr() {
        this.router.navigate(['/pnr-status']);
    }
}
