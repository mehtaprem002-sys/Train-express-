import { Directive, ElementRef, OnInit, Renderer2, Input } from '@angular/core';

@Directive({
    selector: '[appAnimateOnScroll]',
    standalone: true
})
export class AnimateOnScrollDirective implements OnInit {
    @Input() animationClass: string = 'animate-fade-in-up';
    @Input() threshold: number = 0.1;

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    ngOnInit() {
        this.renderer.addClass(this.el.nativeElement, 'opacity-0'); // Initial state

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.renderer.removeClass(this.el.nativeElement, 'opacity-0');
                    this.renderer.addClass(this.el.nativeElement, this.animationClass);
                    observer.unobserve(this.el.nativeElement);
                }
            });
        }, {
            threshold: this.threshold
        });

        observer.observe(this.el.nativeElement);
    }
}
