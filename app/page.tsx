import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, Calculator, GraduationCap, LineChart, Target, BarChart3, Lightbulb, Smartphone, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-blue-950">
      <div className="absolute inset-0 bg-grid-slate-200-50 dark:bg-grid-slate-800-20 bg-[size:var(--grid-size)_var(--grid-size)] [--grid-size:30px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>

      <header className="relative z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">GradeCalc Pro</span>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex">
                <ul className="flex space-x-6">
                  <li><a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</a></li>
                  <li><Link href="/calculator" className="text-sm font-medium hover:text-primary transition-colors">Calculator</Link></li>
                </ul>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-heading animate-in">
            Final Exam Grade Calculator
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Calculate exactly what you need on your finals to achieve your target grades. Now with advanced analytics, what-if scenarios, and mobile support.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/calculator">
                <Calculator className="h-5 w-5" />
                Start Calculating
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <a href="#how-it-works">
                <BookOpen className="h-5 w-5" />
                Learn How It Works
              </a>
            </Button>
          </div>
        </div>

        <section id="features" className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-xl shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Precise Calculations</h3>
              <p className="text-muted-foreground">Get accurate calculations of what you need on your finals based on your current grades and weights.</p>
            </div>
            <div className="glass-card p-6 rounded-xl shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Insights</h3>
              <p className="text-muted-foreground">View interactive charts and visualizations to understand how your final exam impacts your grade.</p>
            </div>
            <div className="glass-card p-6 rounded-xl shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Goal Setting</h3>
              <p className="text-muted-foreground">Set target grades and see exactly what you need to achieve to reach your academic goals.</p>
            </div>
            <div className="glass-card p-6 rounded-xl shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">What-If Scenarios</h3>
              <p className="text-muted-foreground">Explore different scenarios to understand risks and opportunities for your final grades.</p>
            </div>
            <div className="glass-card p-6 rounded-xl shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Grade Statistics</h3>
              <p className="text-muted-foreground">Comprehensive statistical analysis of your academic performance across all classes.</p>
            </div>
            <div className="glass-card p-6 rounded-xl shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile Ready</h3>
              <p className="text-muted-foreground">Works perfectly on all devices with PWA support for offline access and native app experience.</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-3xl mx-auto glass-card p-8 rounded-xl shadow-sm">
            <ol className="space-y-6">
              <li className="flex gap-4">
                <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-lg">Enter your current grades</h3>
                  <p className="text-muted-foreground">Add your classes with current grades and the weight of the final exam.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-lg">Set your target grades</h3>
                  <p className="text-muted-foreground">Choose the grade you want to achieve in each class.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-lg">Get your required scores</h3>
                  <p className="text-muted-foreground">See exactly what you need to score on your finals to reach your targets.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold text-lg">Explore insights and scenarios</h3>
                  <p className="text-muted-foreground">Use advanced analytics, what-if scenarios, and comprehensive statistics to plan your study strategy and understand your academic performance.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="py-12 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Calculate Your Grades?</h2>
          <Button size="lg" className="gap-2" asChild>
            <Link href="/calculator">
              <Calculator className="h-5 w-5" />
              Go to Calculator
            </Link>
          </Button>
        </section>
      </div>

      <footer className="border-t bg-background/80 backdrop-blur-md py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-semibold">GradeCalc Pro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/calculator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Calculator
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4 md:mt-0">
              © {new Date().getFullYear()} GradeCalc Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
