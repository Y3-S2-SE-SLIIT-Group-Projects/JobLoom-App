import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, X, ChevronLeft, Loader2 } from 'lucide-react';

const PhotosSubmitSection = ({
  images,
  imagePreviews,
  handleImageChange,
  removeImage,
  onPrev,
  showActions,
  onCancel,
  cancelLabel,
  canSubmit,
  isSubmitting,
  submitLabel,
  submittingLabel,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  return (
    <div className="space-y-6">
      <div className="border-l-2 border-primary/30 pl-4 sm:pl-5 py-1">
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-primary mb-1.5">
          {t('reviews.section_photos')}
        </p>
        <p className="text-lg font-semibold text-text mb-1">
          {t('reviews.attach_photos')}{' '}
          <span className="text-xs font-medium text-gray-400">
            {t('reviews.attach_photos_hint')}
          </span>
        </p>

        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3.5">
            {imagePreviews.map((src, i) => (
              <div
                key={i}
                className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100 group"
              >
                <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label={t('common.delete')}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < 5 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3.5 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <Camera className="w-4 h-4" />
            {images.length === 0
              ? t('reviews.add_photos')
              : t('reviews.add_more_photos', { count: images.length })}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={e => handleImageChange(e.target.files)}
        />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('common.previous')}
        </button>

        {showActions && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 shadow-sm hover:shadow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotosSubmitSection;
