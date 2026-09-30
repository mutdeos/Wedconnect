# WedConnect

A wedding vendor marketplace. Couples find, compare and book vendors (photographers, caterers, bars, decorators and more), and vendors connect with each other to talk business.

This is the **frontend only**, built with React and Vite. All numbers and content are static placeholder data in [`src/data.js`](src/data.js). Changes you make in the app (bookings, reviews, availability) are saved in the browser's `localStorage`. Use **"Reset demo data"** in the footer to start over.

## Features

- **Registration** as a vendor, bride or groom (`/register?role=vendor|bride|groom`)
- **Vendor search** by category, service option, location, wedding date, rating, price, verified status and saved vendors
- **Vendor categories with service options**, e.g. Catering → *Food only*, *Food + serving staff*, *Full catering*
- **Vendor profiles** with:
  - A photo and video portfolio in a lightbox, for every vendor type
  - Services and prices
  - An availability checker
  - Contact details
- **Star ratings and reviews** with a 1–5 breakdown, "Verified booking" badges, public vendor replies, and highlighted low ratings
- **Booking form** shared by all vendors, with a live price estimate (per-guest pricing supported) and a warning when the vendor is booked on the chosen date
- **Vendor dashboard** where vendors can:
  - Turn availability on or off, with a message for couples
  - Block dates
  - Accept or decline booking requests (accepting blocks the date)
  - Reply to reviews
- **Vendor community** where vendors post discussions by topic: collaboration, referrals, pricing, tips and hiring
- **Saved vendors** (♥) shortlist

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build in dist/
npm run lint     # lint with oxlint
```

## Project structure

```
src/
  data.js                 static data: categories, vendors, reviews, stats, threads
  utils.js                rating, price and date helpers
  store/                  app state (React context + localStorage)
  components/             Layout (navbar/footer), VendorCard, StarRating
  pages/                  Home, Vendors, VendorProfile, Booking, Register, Dashboard, Community
  index.css               all styles
```

## Next steps

- Add a backend and replace `src/data.js` and the store with API calls
- Add real authentication, so the dashboard shows the logged-in vendor
- Only allow reviews from confirmed bookings
- Add payments and deposits, plus messaging between couples and vendors
