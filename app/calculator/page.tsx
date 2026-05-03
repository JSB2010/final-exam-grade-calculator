import type { Metadata } from 'next'
import { ErrorBoundary } from "@/components/error-boundary"
import GradeCalculator from "@/components/grade-calculator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UnifiedFooter } from "@/components/unified-footer"

export const metadata: Metadata = {
  title: 'Final Exam Calculator – What Grade Do I Need on My Final?',
  description: 'Instantly calculate what score you need on your final exam to hit your target course grade. Free, accurate, supports weighted finals and multiple classes simultaneously.',
  alternates: {
    canonical: 'https://finalscalc.com/calculator',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://finalscalc.com/calculator',
      name: 'Final Exam Grade Calculator',
      url: 'https://finalscalc.com/calculator',
      description: 'Free calculator that tells students exactly what score they need on their final exam to achieve their target course grade. Supports multiple classes and weighted finals.',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Calculate required final exam score',
        'Support for multiple classes simultaneously',
        'Weighted grade calculations',
        'What-if scenario explorer',
        'Canvas LMS integration',
        'Grade history tracking',
        'Study planner',
        'Works offline (PWA)',
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Calculate What You Need on Your Final Exam',
      description: 'Use FinalsCalc to find the minimum score you need on your final exam to reach your target grade.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Enter your current grade',
          text: 'Type in your current course grade as a percentage (e.g., 82 for an 82%).',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Set your target grade',
          text: 'Enter the final course grade you want to achieve (e.g., 90 for an A-).',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Enter the final exam weight',
          text: 'Input what percentage of your final grade the exam is worth (e.g., 30 for 30%).',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Read your required score',
          text: 'The calculator instantly shows the exact score you need on your final exam to hit your target. Add more classes to plan your entire finals week.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What grade do I need on my final exam?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Enter your current grade, target grade, and the exam\'s weight to instantly see the score you need. The formula is: Required Score = (Target Grade − Current Grade × (1 − Final Weight/100)) ÷ (Final Weight/100). For example, if you have a 78%, want an 85%, and the final is worth 30%, you need an 82% on the final.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is the final grade calculated?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Your final course grade is calculated as: Final Grade = (Current Grade × (1 − Final Weight/100)) + (Final Exam Score × Final Weight/100). This means your pre-final work accounts for most of your grade, with the exam contributing its weighted percentage.',
          },
        },
        {
          '@type': 'Question',
          name: 'What if I need more than 100% on my final?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'If the calculator shows you need more than 100%, the target grade is mathematically impossible given your current grade and the exam\'s weight. You may want to lower your target grade or check if your professor offers extra credit.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does final exam weight mean?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Final exam weight is the percentage of your total course grade that the final exam counts for. A 30% weight means the final exam determines 30% of your course grade, while everything you\'ve done so far (homework, midterms, quizzes) determines the other 70%.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I calculate grades for multiple classes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! FinalsCalc lets you add multiple classes and calculate all your required final exam scores at once. This makes it easy to prioritize your study time during finals week — focus most on the class where you need the highest score.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this calculator free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, FinalsCalc is completely free with no signup required. It also works offline as a Progressive Web App (PWA) — install it to your home screen and use it anywhere.',
          },
        },
      ],
    },
  ],
}

export default function CalculatorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-blue-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute inset-0 bg-grid-slate-200-50 dark:bg-grid-slate-800-20 bg-[size:var(--grid-size)_var(--grid-size)] [--grid-size:30px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>

      <header className="relative z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-heading">
            Final Exam Grade Calculator
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find out exactly what score you need on your final exam to hit your target grade
          </p>
        </div>

        <ErrorBoundary>
          <GradeCalculator />
        </ErrorBoundary>
      </div>

      {/* SEO content: How to Use + Formula + Grade Reference Table */}
      <div className="container mx-auto py-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* How to Use */}
          <section aria-labelledby="how-to-use-heading">
            <h2 id="how-to-use-heading" className="text-2xl font-bold mb-6">How to Use the Final Exam Calculator</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-muted-foreground">
              <p>
                This free final exam grade calculator tells you the exact score you need on your final exam to achieve your target course grade.
                No guesswork — just enter three numbers and get an instant answer.
              </p>
              <ol className="space-y-3 list-decimal list-inside">
                <li><strong>Enter your current grade</strong> — your grade right now, before the final (e.g., 82 for 82%).</li>
                <li><strong>Set your target grade</strong> — the course grade you want to finish with (e.g., 90 for an A-).</li>
                <li><strong>Enter the final exam weight</strong> — what percentage of your total grade the final counts for (check your syllabus; common values are 20%, 25%, or 30%).</li>
                <li><strong>Read your required score</strong> — the calculator shows exactly what you need to score on the exam.</li>
              </ol>
              <p>
                Add multiple classes to plan your entire finals week. The calculator shows which classes need the most attention so you can prioritize your study time effectively.
              </p>
            </div>
          </section>

          {/* Formula */}
          <section aria-labelledby="formula-heading">
            <h2 id="formula-heading" className="text-2xl font-bold mb-6">The Final Exam Grade Formula</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>The calculation behind this tool uses a straightforward weighted average formula:</p>
              <div className="glass-card rounded-xl p-6 font-mono text-sm overflow-x-auto">
                <p className="font-semibold text-foreground mb-2">Required Score = (Target Grade − Current Grade × (1 − Final Weight / 100)) ÷ (Final Weight / 100)</p>
              </div>
              <p><strong>Worked example:</strong> You currently have a <strong>78%</strong> in a class. You want to finish with at least an <strong>85%</strong>. The final exam is worth <strong>30%</strong> of your grade.</p>
              <div className="glass-card rounded-xl p-6 font-mono text-sm overflow-x-auto space-y-1">
                <p>Required Score = (85 − 78 × (1 − 30/100)) ÷ (30/100)</p>
                <p>Required Score = (85 − 78 × 0.70) ÷ 0.30</p>
                <p>Required Score = (85 − 54.6) ÷ 0.30</p>
                <p>Required Score = 30.4 ÷ 0.30</p>
                <p className="font-semibold text-foreground">Required Score = <strong>101.3%</strong></p>
              </div>
              <p>
                In this case, a 101.3% is mathematically impossible — meaning you cannot reach an 85% no matter what you score on the final.
                You&apos;d need to lower your target to something achievable given your current standing.
                If your required score comes out under 100%, you have a clear, reachable goal.
              </p>
            </div>
          </section>

          {/* Grade Reference Table */}
          <section aria-labelledby="grade-scale-heading">
            <h2 id="grade-scale-heading" className="text-2xl font-bold mb-6">Standard Letter Grade Scale</h2>
            <p className="text-muted-foreground mb-4">Most U.S. colleges and high schools use a grading scale similar to this. Use it to set a realistic target grade.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse glass-card rounded-xl overflow-hidden">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold">Letter Grade</th>
                    <th className="text-left p-4 font-semibold">Percentage Range</th>
                    <th className="text-left p-4 font-semibold">GPA Points</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50"><td className="p-4">A+</td><td className="p-4">97–100%</td><td className="p-4">4.0</td></tr>
                  <tr className="border-b border-border/50"><td className="p-4">A</td><td className="p-4">93–96%</td><td className="p-4">4.0</td></tr>
                  <tr className="border-b border-border/50"><td className="p-4">A−</td><td className="p-4">90–92%</td><td className="p-4">3.7</td></tr>
                  <tr className="border-b border-border/50"><td className="p-4">B+</td><td className="p-4">87–89%</td><td className="p-4">3.3</td></tr>
                  <tr className="border-b border-border/50"><td className="p-4">B</td><td className="p-4">83–86%</td><td className="p-4">3.0</td></tr>
                  <tr className="border-b border-border/50"><td className="p-4">B−</td><td className="p-4">80–82%</td><td className="p-4">2.7</td></tr>
                  <tr className="border-b border-border/50"><td className="p-4">C+</td><td className="p-4">77–79%</td><td className="p-4">2.3</td></tr>
                  <tr className="border-b border-border/50"><td className="p-4">C</td><td className="p-4">73–76%</td><td className="p-4">2.0</td></tr>
                  <tr className="border-b border-border/50"><td className="p-4">C−</td><td className="p-4">70–72%</td><td className="p-4">1.7</td></tr>
                  <tr className="border-b border-border/50"><td className="p-4">D+</td><td className="p-4">67–69%</td><td className="p-4">1.3</td></tr>
                  <tr className="border-b border-border/50"><td className="p-4">D</td><td className="p-4">63–66%</td><td className="p-4">1.0</td></tr>
                  <tr className="border-b border-border/50"><td className="p-4">D−</td><td className="p-4">60–62%</td><td className="p-4">0.7</td></tr>
                  <tr><td className="p-4">F</td><td className="p-4">Below 60%</td><td className="p-4">0.0</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">

              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">What grade do I need on my final to pass the class?</h3>
                <p className="text-muted-foreground">Set your target grade to 60% (or whatever the minimum passing grade is at your school) and enter your current grade and final exam weight. The calculator will show the minimum score you need to pass. If the required score is over 100%, passing is no longer mathematically possible given your current grade.</p>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">What if I need more than 100% on my final?</h3>
                <p className="text-muted-foreground">A required score above 100% means your target grade is mathematically unachievable given your current grade and the exam&apos;s weight. Your best option is to lower your target, or check if your professor offers extra credit. This calculator will still show you how close you can get with a perfect score.</p>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">How does final exam weight affect my grade?</h3>
                <p className="text-muted-foreground">A higher final exam weight means the exam has more influence over your course grade — for better or worse. If your final is worth 40%, a strong performance can significantly raise a borderline grade. Conversely, if it&apos;s only worth 10%, even a perfect score won&apos;t move your grade much. Always check your syllabus for the exact weight.</p>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">Can I use this for multiple classes at once?</h3>
                <p className="text-muted-foreground">Yes — FinalsCalc is built specifically for finals week planning across all your classes. Add each class with its own current grade, target, and exam weight. The overview shows at a glance which exams are most critical and where your time is best spent studying.</p>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">What is the what-if scenario feature?</h3>
                <p className="text-muted-foreground">The what-if explorer lets you try different exam scores and immediately see how they would change your final course grade. It&apos;s useful for setting realistic goals — for example, finding out that scoring a 75% instead of an 85% on your final would drop you from a B+ to a B.</p>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">Does FinalsCalc work with Canvas, Blackboard, or other LMS platforms?</h3>
                <p className="text-muted-foreground">FinalsCalc has a Canvas LMS integration that can import your current grades directly, so you don&apos;t have to manually enter them. For other platforms (Blackboard, Moodle, D2L), you can manually copy your current grade percentage from the gradebook into the calculator.</p>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">Is my grade data saved or shared?</h3>
                <p className="text-muted-foreground">All your data is stored locally in your browser using localStorage — nothing is sent to any server. Your grade information is completely private and only accessible on your device. You can also use the share feature to generate an encoded link if you want to share your setup with someone else.</p>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">Is this final exam calculator free?</h3>
                <p className="text-muted-foreground">Yes, FinalsCalc is 100% free with no account required. It&apos;s also a Progressive Web App (PWA), so you can install it on your phone&apos;s home screen and use it offline — perfect for checking your numbers anywhere, even without internet access.</p>
              </div>

            </div>
          </section>

        </div>
      </div>

      <div className="relative z-10">
        <UnifiedFooter />
      </div>
    </main>
  )
}
