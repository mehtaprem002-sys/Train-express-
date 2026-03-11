import { Component, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-about-us',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="font-sans text-neutral-900 bg-white selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden min-h-screen">

        <!-- 1. HERO: CINEMATIC JOURNEY -->
        <section class="relative h-screen w-full overflow-hidden flex items-center justify-center">
            <!-- Background Image: Standard Unsplash URL with basic params -->
            <div class="absolute inset-0 z-0 bg-neutral-900">
                <img src="assets/img/about-hero.jpg" 
                     class="w-full h-full object-cover opacity-60 scale-105 animate-[slowZoom_20s_infinite_alternate]" 
                     alt="Scenic Train Journey">
            </div>

            <div class="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                <span class="inline-block py-1 px-3 border border-white/30 rounded-full text-xs font-medium tracking-widest uppercase mb-6 backdrop-blur-sm">
                    The World Awaits
                </span>
                <h1 class="text-5xl md:text-7xl font-serif font-medium mb-6 leading-tight">
                    Journey Beyond<br>The Destination.
                </h1>
                <p class="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                    Experience the golden age of travel with modern speed. 
                    From ticket booking to arrival, we ensure every mile is a memory.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button routerLink="/" class="px-8 py-4 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-colors shadow-lg hover:shadow-orange-600/30 transform hover:-translate-y-1">
                        Book Your Ticket
                    </button>
                    <button class="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-full font-medium hover:bg-white/20 transition-colors">
                        View Routes
                    </button>
                </div>
            </div>

            <!-- Scroll Indicator -->
            <div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
                <span class="text-xs uppercase tracking-widest">Scroll</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>


        <!-- 2. BOOKING PROCESS (How It Works) -->
        <section class="py-24 px-6 md:px-12 bg-neutral-50 border-b border-neutral-100">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16 reveal">
                    <h2 class="text-3xl md:text-4xl font-serif font-medium text-neutral-900 mb-4">Seamless Booking</h2>
                    <p class="text-neutral-500 max-w-xl mx-auto">
                        Forget queues and confusing schedules. Our smart booking engine gets you from search to seat in three simple steps.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                     <!-- Step 1: SEARCH (Map/Planning) -->
                     <div class="group text-center reveal" style="transition-delay: 100ms;">
                        <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-8 shadow-md border border-neutral-200 bg-neutral-50">
                            <img src="assets/img/booking-route.jpg" 
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Traveler Planning Route">
                            <div class="absolute top-4 left-4 w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center font-serif font-bold shadow-lg">1</div>
                        </div>
                        <h3 class="text-xl font-bold text-neutral-900 mb-3">Search Your Route</h3>
                        <p class="text-neutral-500 text-sm leading-relaxed px-4">
                            Enter your origin and destination. Our AI finds the fastest and most scenic connections instantly.
                        </p>
                    </div>

                    <!-- Step 2: SELECT (Luxury Interior) -->
                    <div class="group text-center reveal" style="transition-delay: 200ms;">
                        <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-8 shadow-md">
                            <img src="assets/img/booking-class.jpg" 
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Comfortable Train Seat">
                            <div class="absolute top-4 left-4 w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center font-serif font-bold shadow-lg">2</div>
                        </div>
                        <h3 class="text-xl font-bold text-neutral-900 mb-3">Select Your Class</h3>
                        <p class="text-neutral-500 text-sm leading-relaxed px-4">
                            Choose from Sleeper, Executive Chair Car, or First Class luxury suites. View real-time availability.
                        </p>
                    </div>

                    <!-- Step 3: TICKET (Scanning/Phone) -->
                    <div class="group text-center reveal" style="transition-delay: 300ms;">
                        <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-8 shadow-md">
                            <img src="assets/img/booking-ticket-v2.jpg" 
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Scanning Digital Ticket">
                            <div class="absolute top-4 left-4 w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center font-serif font-bold shadow-lg">3</div>
                        </div>
                        <h3 class="text-xl font-bold text-neutral-900 mb-3">Instant E-Ticket</h3>
                        <p class="text-neutral-500 text-sm leading-relaxed px-4">
                            Receive your confirmed ticket via Email & SMS. No printing needed—just scan and board.
                        </p>
                    </div>
                </div>
            </div>
        </section>


        <!-- 3. ADVANCED FEATURES (Replaces Fleet & Benefits) -->
        <section class="py-24 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
            <!-- decorative bg elements -->
            <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div class="absolute top-10 left-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
                <div class="absolute bottom-10 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div class="max-w-7xl mx-auto px-6 relative z-10">
                <div class="text-center mb-16 reveal">
                    <span class="text-orange-500 font-bold tracking-widest text-xs uppercase mb-3 block">Elevate Your Journey</span>
                    <h2 class="text-4xl md:text-5xl font-serif text-white mb-6">Experience the Future of Travel</h2>
                    <p class="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                        We've reimagined every aspect of your journey with cutting-edge technology and premium service.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Feature 1: Best Price -->
                    <div class="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:-translate-y-2 reveal" style="transition-delay: 100ms;">
                        <div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                            🏷️
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-4">Best Price Guarantee</h3>
                        <p class="text-slate-300 leading-relaxed">
                            Find a lower price elsewhere? We'll match it and give you 5% off your next booking. Travel smart, save more.
                        </p>
                    </div>

                    <!-- Feature 2: Live Tracking -->
                    <div class="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-2 reveal" style="transition-delay: 200ms;">
                        <div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                            📍
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-4">Real-Time Tracking</h3>
                        <p class="text-slate-300 leading-relaxed">
                            Share your live location with family. Know exactly when your train arrives with our GPS-enabled precision tracking.
                        </p>
                    </div>

                    <!-- Feature 3: 24/7 Support -->
                    <div class="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-2 reveal" style="transition-delay: 300ms;">
                        <div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                            💬
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-4">24/7 Premium Support</h3>
                        <p class="text-slate-300 leading-relaxed">
                            Our dedicated concierge team is available round-the-clock. From booking changes to special requests, we're here.
                        </p>
                    </div>
                </div>
            </div>
        </section>


        <!-- 5. FAQ (IRCTC Standards - White Theme) -->
        <section class="py-24 bg-white border-t border-neutral-100 relative overflow-hidden">
            <div class="max-w-4xl mx-auto px-6 relative z-10">
                <div class="text-center mb-16 reveal">
                    <span class="text-orange-600 font-bold tracking-widest text-xs uppercase mb-3 block">Indian Railways Guide</span>
                    <h2 class="text-3xl md:text-5xl font-serif text-neutral-900 mb-6">Frequently Asked Questions</h2>
                    <p class="text-neutral-500">Everything you need to know about Tatkal, RAC, and IRCTC rules.</p>
                </div>

                <div class="space-y-4 reveal" style="transition-delay: 200ms;">
                    <div *ngFor="let faq of faqs; let i = index" class="border border-neutral-200 rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-orange-200">
                        <button (click)="toggleFaq(i)" class="w-full flex items-center justify-between p-6 text-left focus:outline-none bg-neutral-50 hover:bg-white transition-colors">
                            <span class="text-xl font-medium text-neutral-800">{{ faq.question }}</span>
                            <span class="transform transition-transform duration-300 text-orange-500 text-2xl" 
                                  [class.rotate-180]="openFaqIndex === i">
                                ▼
                            </span>
                        </button>
                        <div *ngIf="openFaqIndex === i" class="px-6 py-5 text-neutral-600 text-lg leading-relaxed animate-fadeIn border-t border-neutral-100 bg-white">
                            {{ faq.answer }}
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </div>
    `,
    styles: [`
        @keyframes slowZoom {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
        }
        
        /* SCROLL REVEAL ANIMATIONS */
        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
        }
        
        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }
    `]
})
export class AboutUsComponent implements AfterViewInit {
    openFaqIndex: number | null = null;

    faqs = [
        {
            question: "What are the timings for Tatkal booking?",
            answer: "Tatkal booking opens at 10:00 AM for AC classes (1A, 2A, 3A, CC, EC) and at 11:00 AM for Non-AC classes (SL, FC, 2S). Bookings open one day in advance of the actual date of journey."
        },
        {
            question: "How does RAC (Reservation Against Cancellation) work?",
            answer: "If your ticket status is RAC, you are guaranteed a seat but may have to share a berth with another passenger. If a confirmed passenger cancels their ticket, your RAC ticket gets upgraded to a full confirmed berth."
        },
        {
            question: "What is the refund rule for Waitlisted tickets?",
            answer: "If your ticket remains fully waitlisted after the final chart preparation, it is automatically cancelled by the system, and the full amount is refunded to your bank account without any deduction."
        },
        {
            question: "Can I travel with a digital copy of my ID?",
            answer: "Yes, Indian Railways accepts digital versions of Aadhaar and Driving License stored in the official DigiLocker or mParivahan app as valid proof of identity during the journey."
        },
        {
            question: "How many tickets can I book in a month?",
            answer: "A user can book up to 6 tickets per month on their personal ID. However, if your Aadhaar is linked to your IRCTC account, you can book up to 12 tickets per month."
        }
    ];

    ngAfterViewInit() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Reveal only once
                }
            });
        }, {
            threshold: 0.1, // Trigger when 10% visible
            rootMargin: '0px 0px -50px 0px' // Offset to trigger slightly before bottom
        });

        // Select all elements with class 'reveal'
        const hiddenElements = document.querySelectorAll('.reveal');
        hiddenElements.forEach((el) => observer.observe(el));
    }

    toggleFaq(index: number) {
        if (this.openFaqIndex === index) {
            this.openFaqIndex = null;
        } else {
            this.openFaqIndex = index;
        }
    }
}
