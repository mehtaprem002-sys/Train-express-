
import { Component, OnInit, signal, HostListener, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrainService } from '../shared/train.service';
import { AuthService } from '../shared/auth.service';
import { NotificationService } from '../shared/notification.service';

@Component({
   selector: 'app-search-results',
   standalone: true,
   imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
   templateUrl: './search-results.component.html',
   styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
   fromStation = '';
   toStation = '';
   travelDate = '';
   tempFromStation = '';
   tempToStation = '';
   tempTravelDate = '';
   minDate: string = new Date().toISOString().split('T')[0];
   stations = signal<string[]>([]);
   trains = signal<any[]>([]);

   allTrains: any[] = [];
   loading = signal<boolean>(true);

   filteredFromStations: string[] = [];
   filteredToStations: string[] = [];
   showFromSuggestions = false;
   showToSuggestions = false;
   errorMessage = '';
   showModifySearch = true;

   sortBy = 'earliest';
   filterClasses = ['Sleeper', 'AC 3 Tier', 'AC 2 Tier', 'AC 1st Class', 'Chair Car', 'Executive Class', 'Second Sitting'];
   selectedClasses: string[] = [];

   departureTimes = [
      { label: 'Morning', value: 'morning', time: '6 AM - 12 PM', icon: 'wb_sunny' },
      { label: 'Afternoon', value: 'afternoon', time: '12 PM - 6 PM', icon: 'wb_twilight' },
      { label: 'Evening', value: 'evening', time: '6 PM - 12 AM', icon: 'nights_stay' },
      { label: 'Night', value: 'night', time: '12 AM - 6 AM', icon: 'bedtime' }
   ];
   selectedDepartureTimes: string[] = [];

   priceRange = { min: 0, max: 5000 };
   showAvailableOnly = false;
   trainTypes = ['Rajdhani Express', 'Duronto Express', 'Shatabdi Express', 'Vande Bharat', 'Superfast', 'Mail/Express'];
   selectedTrainTypes: string[] = [];

   fromError = '';
   toError = '';
   dateError = '';

   constructor(
      private route: ActivatedRoute,
      private router: Router,
      private trainService: TrainService,
      private authService: AuthService,
      private notificationService: NotificationService
   ) { }

   displayedTrains = signal<any[]>([]);

   ngOnInit() {
      this.trainService.getStations().subscribe(data => {
         this.stations.set(data);
      });

      this.route.queryParams.subscribe(params => {
         this.fromStation = params['from'] || '';
         this.toStation = params['to'] || '';
         this.travelDate = params['date'] || '';

         this.tempFromStation = this.fromStation;
         this.tempToStation = this.toStation;
         this.tempTravelDate = this.travelDate;

         if (this.fromStation && this.toStation) {
            this.search();
         } else {
            this.loading.set(false);
         }
      });
   }

   toggleModifySearch() {
      this.showModifySearch = !this.showModifySearch;
   }

   toggleFilter(type: 'class' | 'departureTime' | 'trainType', value: string) {
      let list: string[];
      if (type === 'class') list = this.selectedClasses;
      else if (type === 'departureTime') list = this.selectedDepartureTimes;
      else list = this.selectedTrainTypes;

      const index = list.indexOf(value);
      if (index === -1) {
         list.push(value);
      } else {
         list.splice(index, 1);
      }
      this.applyFilters();
   }

   resetFilters() {
      this.selectedClasses = [];
      this.selectedDepartureTimes = [];
      this.selectedTrainTypes = [];
      this.priceRange = { min: 0, max: 10000 };
      this.sortBy = 'earliest';
      this.applyFilters();
   }

   filterTrains() {
      this.applyFilters();
   }

   sortTrains() {
      this.applyFilters();
   }

   applyFilters() {
      let filtered = [...this.allTrains];

      if (this.selectedClasses.length > 0) {
         filtered = filtered.filter(t =>
            t.classes?.some((c: any) => this.selectedClasses.some(sel =>
               (c.name || c.type).toLowerCase().includes(sel.toLowerCase()) ||
               (sel === 'Sleeper' && (c.type === 'SL' || c.name === 'Sleeper')) ||
               (sel === 'AC 3 Tier' && (c.type === '3A' || c.name === 'AC 3 Tier')) ||
               (sel === 'AC 2 Tier' && (c.type === '2A' || c.name === 'AC 2 Tier')) ||
               (sel === 'AC 1st Class' && (c.type === '1A' || c.name === 'AC 1st Class')) ||
               (sel === 'Chair Car' && (c.type === 'CC' || c.name === 'Chair Car')) ||
               (sel === 'Executive Class' && (c.type === 'EC' || c.name === 'Executive Class')) ||
               (sel === 'Second Sitting' && (c.type === '2S' || c.name === 'Second Sitting'))
            ))
         );
      }

      if (this.selectedDepartureTimes.length > 0) {
         filtered = filtered.filter(t => {
            const category = this.getDepartureTimeCategory(t.departure);
            return this.selectedDepartureTimes.includes(category);
         });
      }

      if (this.showAvailableOnly) {
         filtered = filtered.filter(t => t.classes.some((c: any) =>
            (c.availability.text.includes('AVAILABLE') || c.availability.text.includes('AVL'))
         ));
      }



      if (this.selectedTrainTypes.length > 0) {
         filtered = filtered.filter(t => {
            const type = t.type || 'Mail/Express';
            return this.selectedTrainTypes.some(sel =>
               type.includes(sel) || t.name.includes(sel.split(' ')[0])
            );
         });
      }

      // Primary Sort: Bookability (Future trains first)
      filtered.sort((a, b) => {
         const aBookable = this.isBookingAllowed(a);
         const bBookable = this.isBookingAllowed(b);

         // 1. Booking Allowed (Time Valid)
         if (aBookable && !bBookable) return -1;
         if (!aBookable && bBookable) return 1;

         // 2. Availability (Seats)
         const aAvail = this.isTrainAvailable(a);
         const bAvail = this.isTrainAvailable(b);
         if (aAvail && !bAvail) return -1;
         if (!aAvail && bAvail) return 1;

         // Secondary Sort: Selected Criteria
         if (this.sortBy === 'earliest') {
            return this.parseTime(a.departure) - this.parseTime(b.departure);
         } else if (this.sortBy === 'price_low') {
            return a.price - b.price;
         } else if (this.sortBy === 'price_high') {
            return b.price - a.price;
         } else if (this.sortBy === 'duration') {
            return this.parseDuration(a.duration) - this.parseDuration(b.duration);
         }
         return 0;
      });

      this.displayedTrains.set(filtered);
   }

   isTrainAvailable(train: any): boolean {
      if (!train.classes || train.classes.length === 0) return false;
      const selectedClassType = train.selectedClass;
      const selectedClassObj = train.classes.find((c: any) => c.type === selectedClassType);

      if (selectedClassObj) {
         const status = selectedClassObj.availability.text.toUpperCase();
         return status.includes('AVAILABLE') || status.includes('AVL');
      }
      return false;
   }

   getDepartureTimeCategory(timeStr: string): string {
      const minutes = this.parseTime(timeStr);
      const hour = Math.floor(minutes / 60);
      if (hour >= 6 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 18) return 'afternoon';
      if (hour >= 18 && hour < 24) return 'evening';
      return 'night';
   }

   parseTime(timeStr: string): number {
      if (!timeStr) return 0;
      if (/am|pm/i.test(timeStr)) {
         const [t, m] = timeStr.trim().split(' ');
         const [h, min] = t.split(':').map(Number);
         let hours = h;
         if (m.toLowerCase() === 'pm' && h !== 12) hours += 12;
         if (m.toLowerCase() === 'am' && h === 12) hours = 0;
         return hours * 60 + min;
      } else {
         const [h, min] = timeStr.trim().split(':').map(Number);
         return h * 60 + min;
      }
   }

   parseDuration(durStr: string): number {
      let hours = 0; let minutes = 0;
      const hMatch = durStr.match(/(\d+)h/);
      const mMatch = durStr.match(/(\d+)m/);
      if (hMatch) hours = parseInt(hMatch[1]);
      if (mMatch) minutes = parseInt(mMatch[1]);
      return hours * 60 + minutes;
   }

   getAvailabilityClass(text: string): string {
      if (!text) return 'text-slate-500 bg-slate-100';
      const t = text.toUpperCase();
      if (t.includes('AVAILABLE') || t.includes('AVL')) return 'text-green-600 bg-green-50 border border-green-200';
      if (t.includes('WL') || t.includes('WAIT')) return 'text-red-600 bg-red-50 border border-red-200';
      if (t.includes('RAC')) return 'text-orange-600 bg-orange-50 border border-orange-200';
      return 'text-slate-500 bg-slate-100';
   }

   swapStations() {
      if (this.showModifySearch) {
         const temp = this.tempFromStation;
         this.tempFromStation = this.tempToStation;
         this.tempToStation = temp;
      } else {
         const temp = this.fromStation;
         this.fromStation = this.toStation;
         this.toStation = temp;
      }
   }

   filterStations(type: 'from' | 'to') {
      const query = type === 'from' ? this.tempFromStation : this.tempToStation;
      if (type === 'from') this.fromError = '';
      if (type === 'to') this.toError = '';
      this.errorMessage = '';
      if (!query) {
         if (type === 'from') { this.filteredFromStations = []; this.showFromSuggestions = false; }
         else { this.filteredToStations = []; this.showToSuggestions = false; }
         return;
      }
      const filtered = this.stations().filter(s => s.toLowerCase().includes(query.toLowerCase()));
      if (type === 'from') { this.filteredFromStations = filtered; this.showFromSuggestions = true; }
      else { this.filteredToStations = filtered; this.showToSuggestions = true; }
   }

   selectStation(station: string, type: 'from' | 'to') {
      if (type === 'from') { this.tempFromStation = station; this.showFromSuggestions = false; }
      else { this.tempToStation = station; this.showToSuggestions = false; }
   }

   @HostListener('document:click', ['$event'])
   onClickOutside(event: Event) {
      const target = event.target as HTMLElement;
      if (!target.closest('.group')) {
         this.showFromSuggestions = false;
         this.showToSuggestions = false;
      }
   }

   updateSearch() {
      if (!this.tempFromStation || !this.tempToStation || !this.tempTravelDate) return;

      if (this.tempFromStation.toLowerCase().trim() === this.tempToStation.toLowerCase().trim()) {
         this.notificationService.showError('Source and Destination stations cannot be the same.');
         return;
      }

      this.fromStation = this.tempFromStation;
      this.toStation = this.tempToStation;
      this.travelDate = this.tempTravelDate;
      this.showModifySearch = false;
      this.router.navigate([], {
         relativeTo: this.route,
         queryParams: { from: this.fromStation, to: this.toStation, date: this.travelDate },
         queryParamsHandling: 'merge'
      });
      this.search();
   }

   search() {
      this.loading.set(true);
      this.trainService.searchTrains(this.fromStation, this.toStation, this.travelDate).subscribe({
         next: (data) => {
            const processedData = data.filter((t: any) => t.isDirect !== false).map((t: any) => {
               let defaultClass = null;
               let defaultPrice = t.price;
               if (t.classes && t.classes.length > 0) {
                  // User specifically wants the first one (left-most)
                  defaultClass = t.classes[0]?.type || null;
                  defaultPrice = t.classes[0]?.price || t.price;
               }

               return {
                  ...t,
                  selectedClass: defaultClass,
                  price: defaultPrice
               };
            });
            this.trains.set(processedData);
            this.allTrains = processedData;
            this.applyFilters();
            this.loading.set(false);
         },
         error: (err) => {
            console.error(err);
            this.loading.set(false);
         }
      });
   }

   selectClass(train: any, cls: any) {
      train.selectedClass = cls.type;
      train.price = cls.price;
   }

   bookTicket(train: any) {
      const selectedClassObj = train.classes.find((c: any) => c.type === train.selectedClass);
      if (!this.authService.isLoggedIn()) {
         this.notificationService.showError('Please login to book a ticket');
         sessionStorage.setItem('currentBookingTrain', JSON.stringify(train));
         sessionStorage.setItem('currentBookingClass', JSON.stringify(selectedClassObj));
         sessionStorage.setItem('currentBookingDate', this.travelDate);
         this.router.navigate(['/login'], { queryParams: { returnUrl: `/booking/${train.number}` } });
         return;
      }
      if (selectedClassObj && selectedClassObj.availability.text.includes('REGRET')) {
         this.notificationService.showError('Booking not allowed for REGRET status.');
         return;
      }
      this.router.navigate(['/booking', train.number], {
         state: { train: train, selectedClass: selectedClassObj, travelDate: this.travelDate }
      });
   }

   isBookingAllowed(train: any): boolean {
      if (!this.travelDate || !train.departure) return true;
      try {
         const travelDateObj = new Date(this.travelDate);
         const now = new Date();
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         const checkDate = new Date(travelDateObj);
         checkDate.setHours(0, 0, 0, 0);
         if (checkDate > today) return true;
         if (checkDate < today) return false;
         let hours = 0; let minutes = 0;
         const timeStr = train.departure.trim();
         if (/am|pm/i.test(timeStr)) {
            const [time, modifier] = timeStr.split(' ');
            const parts = time.split(':');
            hours = parseInt(parts[0], 10);
            minutes = parseInt(parts[1], 10);
            if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
            if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
         } else {
            const parts = timeStr.split(':');
            hours = parseInt(parts[0], 10);
            minutes = parseInt(parts[1], 10);
         }
         const departureTime = new Date(now);
         departureTime.setHours(hours, minutes, 0, 0);
         const diffMs = departureTime.getTime() - now.getTime();
         const bufferMs = 30 * 60 * 1000;
         return diffMs > bufferMs;
      } catch (e) { return true; }
   }

   selectedTrainForRoute: any = null;
   showRouteModal = false;

   openRoute(train: any) {
      this.selectedTrainForRoute = train;
      this.showRouteModal = true;
   }

   closeRoute() {
      this.showRouteModal = false;
      this.selectedTrainForRoute = null;
   }

   getStopDay(schedule: any[], index: number): string {
      if (!schedule || index < 0) return 'Day-1';
      let day = 1;
      for (let i = 1; i <= index; i++) {
         const prevDep = this.parseTime(schedule[i - 1].departure || schedule[i - 1].arrival);
         const currArr = this.parseTime(schedule[i].arrival || schedule[i].departure);
         if (currArr < prevDep) {
            day++;
         }
      }
      return `Day-${day}`;
   }
}
