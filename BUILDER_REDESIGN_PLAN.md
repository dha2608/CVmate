# CV Builder Redesign Plan

## 🎯 Mục tiêu
Thiết kế lại CV Builder với giao diện hiện đại, chuyên nghiệp, dễ sử dụng hơn cho cả 3 nhóm người dùng:
- **New Users**: Quick start, guided flow
- **Experienced Users**: Full control, power features
- **Lazy Users**: AI assistance, automation

---

## 📐 Layout Mới

### 1. **Sidebar Navigation** (Thay vì Tabs)
- **Vị trí**: Bên trái, có thể collapse
- **Nội dung**:
  - Logo/Brand (top)
  - Section navigation (Personal, Summary, Experience, Education, Skills)
  - Quick actions (Save, Download, Settings)
  - Progress indicator (cho Guided Mode)
- **Lợi ích**: 
  - Tiết kiệm không gian header
  - Dễ navigate giữa các sections
  - Có thể thêm sections mới dễ dàng
  - Mobile: có thể collapse thành hamburger menu

### 2. **Header Gọn Gàng**
- **Cấu trúc**:
  - Left: Back button + Title
  - Center: Mode toggle (Guided/Power) - chỉ hiện trên desktop
  - Right: Action menu (dropdown) thay vì nhiều buttons
- **Action Menu Dropdown**:
  - Template selector
  - Sections manager
  - AI Suggestions
  - Keyboard shortcuts
  - Settings
- **Lợi ích**: 
  - Không còn overlap
  - Clean, professional
  - Dễ mở rộng

### 3. **Main Content Area**
- **Layout**: 
  - Left: Form editor (60% width)
  - Right: Live preview (40% width)
  - Có thể toggle fullscreen preview
- **Form Editor**:
  - Card-based design cho mỗi section
  - Better spacing và typography
  - Visual progress indicator
  - Inline help/guidance

### 4. **Preview Panel**
- **Features**:
  - Toggle fullscreen mode
  - Zoom controls (50%, 75%, 100%, 125%, 150%)
  - Download PDF button (floating)
  - ATS score indicator (nếu có)
- **Layout**: 
  - Sticky header với controls
  - Scrollable content
  - Print-optimized styling

---

## 🎨 Design System

### Color Palette
- **Primary**: Crimson Red (#DC2626)
- **Secondary**: Gray scale
- **Accent**: Purple/Pink cho AI features
- **Success**: Green cho saved state
- **Warning**: Yellow cho suggestions

### Typography
- **Headers**: Inter, bold, clear hierarchy
- **Body**: Inter, regular, readable
- **Labels**: Small, medium weight
- **Code/Technical**: Monospace cho skills

### Spacing
- **Cards**: Padding 6 (24px)
- **Sections**: Gap 6-8 (24-32px)
- **Form fields**: Gap 4 (16px)
- **Buttons**: Padding 3-4 (12-16px)

### Components
- **Cards**: Rounded-lg, shadow-sm, border
- **Buttons**: Rounded-lg, clear states
- **Inputs**: Rounded-md, focus ring
- **Dropdowns**: Rounded-xl, shadow-lg

---

## 🚀 Features Mới

### 1. **Sidebar Navigation**
```tsx
- Logo/Brand
- Section list với icons
- Active state highlighting
- Collapse/expand toggle
- Quick actions (Save, Download)
- Progress bar (Guided Mode)
```

### 2. **Action Menu Dropdown**
```tsx
- Template selector (icon + label)
- Sections manager (icon + label)
- AI Suggestions (icon + badge)
- Keyboard shortcuts (icon)
- Settings (icon)
```

### 3. **Preview Controls**
```tsx
- Fullscreen toggle
- Zoom slider/buttons
- Download PDF (floating)
- ATS score (nếu có)
- Print preview
```

### 4. **Form Improvements**
```tsx
- Card-based sections
- Inline validation
- Character counters
- Auto-save indicator
- Section completion status
```

### 5. **Guided Mode Enhancements**
```tsx
- Step-by-step wizard
- Progress indicator
- Next/Previous navigation
- Skip optional sections
- Completion summary
```

---

## 📱 Responsive Design

### Mobile (< 768px)
- Sidebar collapse thành hamburger menu
- Full-width form editor
- Preview toggle (show/hide)
- Stacked layout
- Bottom action bar

### Tablet (768px - 1024px)
- Collapsible sidebar
- 50/50 split editor/preview
- Touch-friendly controls

### Desktop (> 1024px)
- Full sidebar navigation
- 60/40 split editor/preview
- All features visible
- Keyboard shortcuts

---

## 🔄 Migration Strategy

### Phase 1: Layout Restructure
1. Tạo sidebar component
2. Refactor header với dropdown menu
3. Update main layout (sidebar + content)

### Phase 2: Component Updates
1. Convert tabs → sidebar navigation
2. Update form components với card design
3. Enhance preview panel với controls

### Phase 3: Features & Polish
1. Add fullscreen preview
2. Add zoom controls
3. Improve guided mode
4. Add progress indicators
5. Mobile optimization

---

## ✅ Success Metrics
- **Usability**: Giảm số clicks để navigate
- **Visual**: Clean, professional appearance
- **Performance**: Không ảnh hưởng load time
- **Mobile**: Better mobile experience
- **User Feedback**: Positive response

---

## 🎯 Next Steps
1. ✅ Tạo plan chi tiết
2. ⏭️ Implement sidebar navigation
3. ⏭️ Refactor header với dropdown
4. ⏭️ Update layout structure
5. ⏭️ Enhance preview panel
6. ⏭️ Improve form components
7. ⏭️ Add responsive behavior
8. ⏭️ Test & polish
