import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {

  cart:any[] = JSON.parse(localStorage.getItem("cart") || "[]");

  removeItem(index:number){
    this.cart.splice(index,1);
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }
  increaseQty(index:number){
  this.cart[index].quantity++;
  localStorage.setItem("cart", JSON.stringify(this.cart));
}

decreaseQty(index:number){
  if(this.cart[index].quantity > 1){
    this.cart[index].quantity--;
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }
}
  getTotal(){
    return this.cart.reduce((sum,item)=> sum + item.price * item.quantity,0);
  }

}