import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService, NewsItem } from '../../../services/news.service';

interface NewsForm {
  title: string;
  slug: string;
  summary: string;
  content: string;
  image_url: string;
  author_name: string;
  status: 0 | 1;
  is_featured: boolean;
  published_at: string | null;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent implements OnInit {
  listNews: NewsItem[] = [];
  isLoading = true;
  errorMessage = '';
  isSubmitting = false;
  uploadingImage = false;
  minPublishDatetime: string | null = null;


  showModal = false;
  editingNews: NewsItem | null = null;
  form: NewsForm = {
    title: '',
    slug: '',
    summary: '',
    content: '',
    image_url: '',
    author_name: '',
    status: 1,
    is_featured: false,
    published_at: null
  };
  // preview URL for selected/uploaded image (can be object URL or final backend URL)
  previewImage: string | null = null;
  private _tempObjectUrl: string | null = null;

  constructor(
    private newsService: NewsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.isLoading = true;
    this.newsService.getAllNews().subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.listNews = Array.isArray(res.data) ? res.data : [];
        } else {
          this.listNews = [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Lỗi API:', err);
        // Try to show more helpful message when backend returns JSON
        this.errorMessage = err?.error?.message || err?.message || 'Lỗi kết nối server.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getListImage(item: NewsItem | any): string | null {
    const raw = (item as any).imageUrl ?? (item as any).image_url ?? '';
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    try {
      const base = (this.newsService as any).getApiBase();
      return base ? base + raw : raw;
    } catch (e) {
      return raw;
    }
  }

  openAddModal(): void {
    this.showModal = true;
    this.editingNews = null;
    this.errorMessage = '';
    this.form = {
      title: '',
      slug: '',
      summary: '',
      content: '',
      image_url: '',
      author_name: '',
      status: 1,
      is_featured: false,
      published_at: null
    };
    // clear preview
    if (this._tempObjectUrl) {
      try { URL.revokeObjectURL(this._tempObjectUrl); } catch {}
      this._tempObjectUrl = null;
    }
    this.previewImage = null;
    // set default publish datetime to now and prevent selecting past dates
    const now = this.nowToDatetimeLocal();
    this.form.published_at = now;
    this.minPublishDatetime = now;
  }

  private nowToDatetimeLocal(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  editItem(item: NewsItem): void {
    this.showModal = true;
    this.editingNews = { ...item };
    this.errorMessage = '';
    this.form = {
      title: item.title || '',
      slug: (item.slug ?? '') as string,
      summary: (item.summary ?? '') as string,
      content: (item.content ?? '') as string,
      image_url: ((item as any).image_url ?? (item as any).imageUrl ?? '') as string,
      author_name: ((item as any).author_name ?? (item as any).authorName ?? '') as string,
      status: (Number(item.status) === 1 ? 1 : 0) as 0 | 1,
      is_featured: Number((item as any).is_featured ?? (item as any).isFeatured) === 1,
      published_at: this.toDatetimeLocalValue((item as any).published_at ?? (item.publishedAt ?? null) as string | null)
    };
    // when editing, allow past dates (do not force min)
    this.minPublishDatetime = null;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingNews = null;
    this.form = {
      title: '',
      slug: '',
      summary: '',
      content: '',
      image_url: '',
      author_name: '',
      status: 1,
      is_featured: false,
      published_at: null
    };
    this.isSubmitting = false;
    this.minPublishDatetime = null;
    if (this._tempObjectUrl) {
      try { URL.revokeObjectURL(this._tempObjectUrl); } catch {}
      this._tempObjectUrl = null;
    }
    this.previewImage = null;
  }

  private normalizeDatetimeLocalInput(value: string | null | undefined): string | null {
    if (!value) return null;
    const v = String(value).trim();
    if (!v) return null;
    // Keep `datetime-local` string (YYYY-MM-DDTHH:mm or with seconds); backend will normalize.
    return v;
  }

  private toDatetimeLocalValue(value: string | null | undefined): string | null {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  save(): void {
    if (!this.form.title || !this.form.title.trim()) {
      this.errorMessage = 'Vui lòng nhập tiêu đề';
      return;
    }

    this.isSubmitting = true;
    const payload = {
      title: this.form.title.trim(),
      slug: this.form.slug.trim() || null,
      summary: this.form.summary.trim() || null,
      content: this.form.content.trim() || null,
      image_url: (this.form.image_url || '').trim() || null,
      author_name: (this.form.author_name || '').trim() || null,
      status: this.form.status,
      is_featured: this.form.is_featured ? 1 : 0,
      published_at: this.normalizeDatetimeLocalInput(this.form.published_at)
    };

    if (this.editingNews) {
      this.newsService.updateNews(this.editingNews.id, payload).subscribe({
        next: (res: any) => {
          if (res?.success) {
            alert('✅ Cập nhật thành công!');
            this.closeModal();
            this.loadNews();
          } else {
            this.errorMessage = res?.message || 'Cập nhật thất bại';
          }
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Lỗi cập nhật tin tức';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.newsService.createNews(payload).subscribe({
        next: (res: any) => {
          if (res?.success) {
            alert('✅ Thêm thành công!');
            this.closeModal();
            this.loadNews();
          } else {
            this.errorMessage = res?.message || 'Thêm thất bại';
          }
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Lỗi thêm tin tức';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log('onFileSelected called, files:', input?.files && input.files.length);
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowed.includes(file.type)) {
      this.errorMessage = 'Vui lòng chọn ảnh định dạng JPG/PNG/GIF';
      return;
    }

    // create an object URL to preview immediately
    try {
      if (this._tempObjectUrl) {
        try { URL.revokeObjectURL(this._tempObjectUrl); } catch {}
      }
      this._tempObjectUrl = URL.createObjectURL(file);
      this.previewImage = this._tempObjectUrl;
    } catch (e) {
      // ignore if object URL not available
      this.previewImage = null;
    }

    const form = new FormData();
    form.append('image', file);

    this.uploadingImage = true;
    this.newsService.uploadImage(form).subscribe({
      next: (res: any) => {
        if (res?.success && res?.url) {
          // backend returns path starting with /public/...
          this.form.image_url = res.url;
          // compute absolute preview URL when the backend returned a relative path
          if (typeof res.url === 'string') {
            let final = res.url;
            if (!/^https?:\/\//i.test(final) && final.startsWith('/')) {
              final = (this.newsService as any).getApiBase()
                ? (this.newsService as any).getApiBase() + final
                : final;
            }
            this.previewImage = final;
            // revoke temp object URL since we now show server URL
            if (this._tempObjectUrl) {
              try { URL.revokeObjectURL(this._tempObjectUrl); } catch {}
              this._tempObjectUrl = null;
            }
          }
        } else if (res?.success && res?.data?.url) {
          this.form.image_url = res.data.url;
          const u = res.data.url as string;
          let final = u;
          if (!/^https?:\/\//i.test(final) && final.startsWith('/')) {
            final = (this.newsService as any).getApiBase()
              ? (this.newsService as any).getApiBase() + final
              : final;
          }
          this.previewImage = final;
          if (this._tempObjectUrl) {
            try { URL.revokeObjectURL(this._tempObjectUrl); } catch {}
            this._tempObjectUrl = null;
          }
        } else {
          this.errorMessage = res?.message || 'Upload thất bại';
        }
        this.uploadingImage = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Lỗi upload ảnh';
        this.uploadingImage = false;
        this.cdr.detectChanges();
      }
    });
  }

  getImagePreviewSrc(): string | null {
    if (this.previewImage) return this.previewImage;
    if (this.form && this.form.image_url) {
      const url = this.form.image_url;
      if (/^https?:\/\//i.test(url)) return url;
      // prefix with backend base
      try {
        const base = (this.newsService as any).getApiBase();
        return base ? base + url : url;
      } catch (e) {
        return url;
      }
    }
    return null;
  }

  toggleVisibility(item: NewsItem): void {
    const current = Number(item.status) === 1 ? 1 : 0;
    const newStatus: 0 | 1 = current === 1 ? 0 : 1;
    const confirmMsg = newStatus === 1
      ? `Bạn có muốn hiển thị tin tức "${item.title}" không?`
      : `Bạn có muốn tạm ẩn tin tức "${item.title}" không?`;

    if (!confirm(confirmMsg)) return;

    this.isSubmitting = true;
    const payload: any = {
      title: item.title,
      content: item.content ?? null,
      image_url: (item as any).image_url ?? (item as any).imageUrl ?? null,
      status: newStatus
    };

    this.newsService.updateNews(item.id, payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          alert(newStatus === 1 ? 'Tin tức đã được hiển thị!' : 'Tin tức đã tạm ẩn!');
          this.loadNews();
        } else {
          this.errorMessage = res?.message || 'Cập nhật trạng thái thất bại';
        }
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = err?.error?.message || err?.message || 'Lỗi kết nối server!';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteItem(id: number): void {
    if (!confirm('Bạn chắc chắn muốn xóa tin tức này?')) return;

    this.newsService.deleteNews(id).subscribe({
      next: (res: any) => {
        if (res?.success) {
          alert('✅ Xóa thành công!');
          this.loadNews();
        } else {
          this.errorMessage = res?.message || 'Xóa thất bại';
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi xóa tin tức';
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(date?: string | null): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('vi-VN');
  }
}
