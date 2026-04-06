import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-return',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-return.component.html',
  styleUrls: ['./checkout-return.component.scss']
})
export class CheckoutReturnComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isSuccess = false;
  title = 'Thanh toán chưa thành công';
  message = 'Giao dịch không thành công hoặc đã bị hủy.';
  orderRef = '';
  amount = 0;

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;

    const responseCode = query.get('vnp_ResponseCode') || '';
    this.orderRef = query.get('vnp_TxnRef') || '';

    const amountRaw = Number(query.get('vnp_Amount') || 0);
    this.amount = amountRaw > 0 ? amountRaw / 100 : 0;

    this.isSuccess = responseCode === '00';

    if (this.isSuccess) {
      this.title = 'Thanh toán thành công';
      this.message = 'Cảm ơn bạn. Đơn hàng đã được ghi nhận và đang chờ xử lý.';
      localStorage.removeItem('cart');
    }
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
