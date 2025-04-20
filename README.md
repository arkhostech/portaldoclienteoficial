# Client Portal – Kortex Labs

A modern web application for managing client access, documents, and legal processes. Built with performance and user experience in mind, this portal provides a secure and intuitive interface for clients and administrators.

## Features

- Secure client authentication and authorization
- Document management and sharing
- Process tracking and status updates
- Real-time notifications
- Responsive design for all devices
- Dark/Light mode support

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query
- **Authentication**: Supabase
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)
- [nvm](https://github.com/nvm-sh/nvm) (optional, for Node.js version management)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kortexlabs/client-portal.git
   cd client-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:8080](http://localhost:8080) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Deployment

This application can be deployed to various platforms:

### Vercel

1. Push your code to a Git repository
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

### Netlify

1. Push your code to a Git repository
2. Create a new site in Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy

### Custom Domain

To use a custom domain:

1. Add your domain in your hosting provider's dashboard
2. Configure DNS settings:
   - Add an A record pointing to your hosting provider's IP
   - Add a CNAME record for www subdomain
3. Enable SSL/HTTPS (usually automatic with modern hosting providers)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software owned by Kortex Labs. All rights reserved.

---

Developed by Kortex Labs – kortexlabs@gmail.com

