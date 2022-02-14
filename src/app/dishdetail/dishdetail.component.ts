import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback } from '../shared/feedback';
import { Comment } from '../shared/comment';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

export class DishdetailComponent implements OnInit {
       
    dish: Dish;
    dishIds: string[];
    prev: string;
    next: string;
    errMess: string;
   
    @ViewChild('fform') feedbackFormDirective;
    feedbackForm: FormGroup;
    feedback: Comment;
  
    
    formErrors = {
      'author': '',
      'comment': ''
    }
  
    validationMessages = {
      'author': {
        'required': 'Name is required.',
        'minlength': 'Name must be at least 2 characters long',
        'maxlength': 'Name cannot be more than 25 characters long'
      },
      'comment': {
        'required': 'Your comment is required.',
        'minlength': 'Your comment must be at least 2 characters long',
        'maxlength': 'Your comment cannot be more than 500 characters long'
      }
    };

    constructor(private dishService: DishService,
      private route: ActivatedRoute,
      private location: Location,
      private fb: FormBuilder,
      @Inject('BaseURL') private BaseURL) { 
        this.createForm();
      }

  ngOnInit() { 
    this.dishService.getDishIds()
    .subscribe((dishIds) => this.dishIds = dishIds);
    this.route.params
    .pipe(switchMap((params: Params) =>this.dishService.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); },
    errmess => this.errMess = <any>errmess);
  }

    setPrevNext(dishId: string) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }

    goBack(): void {
        this.location.back();
    }

    createForm(): void {
      this.feedbackForm = this.fb.group({
        author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
        comment: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(500)]],
        rating: 5,
        date: ['']
          });
  
      this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
  
      this.onValueChanged(); // reset form validation messages
    }
  
    onValueChanged(data?: any) {
      if (!this.feedbackForm) { return; }
      const form = this.feedbackForm;
      for (const field in this.formErrors) {
        if (this.formErrors.hasOwnProperty(field)) {
          //clear previous error message (if any)
          this.formErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid) {
            const messages = this.validationMessages[field];
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                this.formErrors[field] += messages[key] + ' ';
              }
            }
          }
        }
      }
    }
  
    onSubmit() {
      this.feedback = this.feedbackForm.value;
      this.feedback.date = new Date().toISOString();
      this.dish.comments.push(this.feedback);
      this.feedbackForm.reset({
        author: '',
        comment: '',
        date: '' 
      });
      this.feedbackFormDirective.resetForm({rating: 5});
    }
}

