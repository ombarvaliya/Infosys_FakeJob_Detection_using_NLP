import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Analyze', href: '/analyze' },
  ]

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">JC</span>
            </div>
            <span className="font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">
              JobCheck AI
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-slate-600 hover:text-primary-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-slate-600 hover:text-primary-600"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-4 py-2 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
