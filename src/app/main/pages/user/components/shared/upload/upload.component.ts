import { Component, inject, model } from '@angular/core';
import { GlobalService } from '../../../../../../../core/global.service';
import { SharedCoreService } from '../../../../../../../core/sharedCore.service';
import { MainService } from '../../../../../../../core/main.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { fade } from '../../../../../../../animations';

@Component({
  selector: 'app-upload',
  imports: [
        CommonModule, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
  animations:[fade]
})
export class UploadComponent {
  imageUrl: string | null = null;
  public _globalService = inject(GlobalService);
  public _sharedCoreService = inject(SharedCoreService);
  public mainService = inject(MainService);
 public _dialogRef = inject(MatDialogRef<UploadComponent>);
  videoUrl: string | null = null;
  caption: string = '';
  hashtags: string = '';
    description:string ='';
uploadMessage: string | null = null;
selectedFile: File | null = null;
  posting: boolean = false;
onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const validVideoTypes = ['video/mp4', 'video/mov', 'video/quicktime'];
      const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      // Revoke previous URLs to prevent memory leaks
      if (this.videoUrl) URL.revokeObjectURL(this.videoUrl);
      if (this.imageUrl) URL.revokeObjectURL(this.imageUrl);

      if (validVideoTypes.includes(file.type)) {
        this.videoUrl = URL.createObjectURL(file);
        this.imageUrl = null;
        this.selectedFile = file;
        this.uploadMessage = null;
      } else if (validImageTypes.includes(file.type)) {
        this.imageUrl = URL.createObjectURL(file);
        this.videoUrl = null;
        this.selectedFile = file;
        this.uploadMessage = null;
      } else {
        this.uploadMessage = 'Please select a valid file (MP4, MOV, PNG, or JPEG).';
        this.selectedFile = null;
        this.videoUrl = null;
        this.imageUrl = null;
        input.value = ''; // Clear input for invalid files
      }
    }
  }
   postMedia(): void {
    if (!this.selectedFile) {
      this.uploadMessage = 'No file selected.';
      return;
    }
    this.posting = true;
    this.uploadMessage = null;

    this.mainService.uploadMedia(this.selectedFile, this.hashtags, this.description).subscribe({
      next: () => {
        this.uploadMessage = `${this.videoUrl ? 'Video' : 'Image'} uploaded successfully!`;
        this.posting = false;
        this.resetForm();
        this._dialogRef.close(true);
      },
      error: (err) => {
        this.uploadMessage = `Upload failed: ${err.message || 'Please try again.'}`;
        this.posting = false;
      }
    });
  }
  close(){
    this._dialogRef.close();
  }
    resetForm(): void {
    // Revoke URLs before setting to null
    if (this.videoUrl) URL.revokeObjectURL(this.videoUrl);
    if (this.imageUrl) URL.revokeObjectURL(this.imageUrl);
    this.videoUrl = null;
    this.imageUrl = null;
    this.selectedFile = null;
    this.hashtags = ''; // Consistent with array type
    this.description = '';
    this.uploadMessage = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = ''; // Clear file input
  }
}
