"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { LightbulbIcon, Calculator, BarChart4, PieChart as PieChartIcon, Save, Sparkles, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { GradeClass, GradeBand } from "@/types/grade-calculator"

type WhatIfScenario = {
  id: string
  name: string
  classId: string
  finalExamScore: number
  resultingGrade: number
  saved: boolean
}

type WhatIfSimulatorProps = {
  classes: GradeClass[]
  gradeBands: GradeBand[]
  formatGrade: (grade: number) => string
}

export default function WhatIfSimulator({ classes, gradeBands, formatGrade }: WhatIfSimulatorProps) {
  const { toast } = useToast()
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    classes.length > 0 ? classes[0].id : null
  )
  const [finalExamScore, setFinalExamScore] = useState(85)
  const [scenarios, setScenarios] = useState<WhatIfScenario[]>([])
  const [scenarioName, setScenarioName] = useState("My Scenario")
  const [activeTab, setActiveTab] = useState("simulator")
  
  // Calculate the resulting grade based on current grade, weight, and final exam score
  const calculateFinalGrade = (current: number, weight: number, finalScore: number) => {
    return current * (1 - weight / 100) + (finalScore * weight) / 100
  }
  
  // Get the letter grade for a numeric grade
  const getLetterGrade = (grade: number) => {
    for (const band of gradeBands) {
      if (grade >= band.cutoff) {
        return band.label
      }
    }
    return "F"
  }
  
  // Get the color for a grade band
  const getGradeColor = (grade: number) => {
    for (const band of gradeBands) {
      if (grade >= band.cutoff) {
        return band.color
      }
    }
    return "bg-red-500"
  }
  
  // Generate a unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9)
  
  // Save the current scenario
  const saveScenario = () => {
    if (!selectedClassId) return
    
    const selectedClass = classes.find(cls => cls.id === selectedClassId)
    if (!selectedClass) return
    
    const resultingGrade = calculateFinalGrade(
      selectedClass.current,
      selectedClass.weight,
      finalExamScore
    )
    
    const newScenario: WhatIfScenario = {
      id: generateId(),
      name: scenarioName,
      classId: selectedClassId,
      finalExamScore,
      resultingGrade,
      saved: true
    }
    
    setScenarios([...scenarios, newScenario])
    setScenarioName(`My Scenario ${scenarios.length + 2}`)
    
    toast({
      title: "Scenario saved",
      description: `"${scenarioName}" has been saved for ${selectedClass.name}`,
    })
  }
  
  // Delete a scenario
  const deleteScenario = (id: string) => {
    setScenarios(scenarios.filter(scenario => scenario.id !== id))
    
    toast({
      title: "Scenario deleted",
      description: "The scenario has been removed",
    })
  }
  
  // Get the selected class
  const getSelectedClass = () => {
    if (!selectedClassId) return null
    return classes.find(cls => cls.id === selectedClassId) || null
  }
  
  // Get scenarios for the selected class
  const getClassScenarios = () => {
    if (!selectedClassId) return []
    return scenarios.filter(scenario => scenario.classId === selectedClassId)
  }
  
  // Calculate the current scenario (not saved)
  const getCurrentScenario = () => {
    const selectedClass = getSelectedClass()
    if (!selectedClass) return null
    
    const resultingGrade = calculateFinalGrade(
      selectedClass.current,
      selectedClass.weight,
      finalExamScore
    )
    
    return {
      id: "current",
      name: "Current Simulation",
      classId: selectedClassId,
      finalExamScore,
      resultingGrade,
      saved: false
    }
  }
  
  // Prepare data for charts
  const prepareChartData = () => {
    const selectedClass = getSelectedClass()
    if (!selectedClass) return { pieData: [], barData: [] }
    
    const classScenarios = getClassScenarios()
    const currentScenario = getCurrentScenario()
    
    // Add current scenario if it exists
    const allScenarios = currentScenario 
      ? [...classScenarios, currentScenario]
      : classScenarios
    
    // Prepare pie chart data
    const pieData = [
      {
        name: "Current Grade",
        value: selectedClass.current,
        color: "hsl(var(--chart-1))"
      },
      {
        name: "Final Exam Impact",
        value: currentScenario 
          ? currentScenario.resultingGrade - selectedClass.current
          : 0,
        color: currentScenario && currentScenario.resultingGrade > selectedClass.current
          ? "hsl(var(--chart-2))"
          : "hsl(var(--chart-5))"
      }
    ]
    
    // Prepare bar chart data
    const barData = allScenarios.map(scenario => ({
      name: scenario.name,
      grade: scenario.resultingGrade,
      current: scenario.id === "current",
      letterGrade: getLetterGrade(scenario.resultingGrade)
    }))
    
    return { pieData, barData }
  }
  
  const selectedClass = getSelectedClass()
  const classScenarios = getClassScenarios()
  const currentScenario = getCurrentScenario()
  const { pieData, barData } = prepareChartData()
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="simulator" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="simulator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span>Simulator</span>
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Saved Scenarios</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart4 className="h-4 w-4" />
              <span>Comparison</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="simulator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>What-If Simulator</CardTitle>
                  <CardDescription>
                    See how different final exam scores would affect your grade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="class-select">Select Class</Label>
                      <Select
                        value={selectedClassId || ""}
                        onValueChange={setSelectedClassId}
                        disabled={classes.length === 0}
                      >
                        <SelectTrigger id="class-select">
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map(cls => (
                            <SelectItem key={cls.id} value={cls.id}>
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full ${cls.color} mr-2`}></div>
                                <span>{cls.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedClass && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label>Current Grade</Label>
                            <div className="text-2xl font-bold">{formatGrade(selectedClass.current)}%</div>
                            <div className="text-sm text-muted-foreground">
                              {getLetterGrade(selectedClass.current)}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label>Final Exam Weight</Label>
                            <div className="text-2xl font-bold">{formatGrade(selectedClass.weight)}%</div>
                            <div className="text-sm text-muted-foreground">
                              of total grade
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="final-score">Final Exam Score</Label>
                            <div className="w-24">
                              <Input
                                id="final-score"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={finalExamScore}
                                onChange={(e) => setFinalExamScore(parseFloat(e.target.value) || 0)}
                                className="h-8 text-right"
                              />
                            </div>
                          </div>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[finalExamScore]}
                            onValueChange={(value) => setFinalExamScore(value[0])}
                            className="py-2"
                          />
                        </div>
                        
                        {currentScenario && (
                          <div className="bg-muted p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium">Resulting Grade</h3>
                              <Badge className={getGradeColor(currentScenario.resultingGrade)}>
                                {getLetterGrade(currentScenario.resultingGrade)}
                              </Badge>
                            </div>
                            <div className="text-3xl font-bold mb-2">
                              {formatGrade(currentScenario.resultingGrade)}%
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <div className="flex items-center">
                                {currentScenario.resultingGrade > selectedClass.current ? (
                                  <>
                                    <Badge variant="outline" className="text-emerald-500 border-emerald-200 dark:border-emerald-800 mr-2">
                                      +{formatGrade(currentScenario.resultingGrade - selectedClass.current)}%
                                    </Badge>
                                    <span>Improvement from current grade</span>
                                  </>
                                ) : currentScenario.resultingGrade < selectedClass.current ? (
                                  <>
                                    <Badge variant="outline" className="text-red-500 border-red-200 dark:border-red-800 mr-2">
                                      {formatGrade(currentScenario.resultingGrade - selectedClass.current)}%
                                    </Badge>
                                    <span>Decrease from current grade</span>
                                  </>
                                ) : (
                                  <span>No change from current grade</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="scenario-name">Scenario Name</Label>
                    <Input
                      id="scenario-name"
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                      className="w-48"
                    />
                  </div>
                  <Button onClick={saveScenario} disabled={!selectedClassId}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Scenario
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Grade Breakdown</CardTitle>
                  <CardDescription>
                    Impact of final exam on your grade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    {selectedClass && pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            labelLine={false}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${formatGrade(Number(value))}%`, ""]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">
                          {selectedClassId
                            ? "Select a class to view grade breakdown"
                            : "No classes available"}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {selectedClass && currentScenario && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))] mr-2"></div>
                          <span>Current Grade</span>
                        </div>
                        <span className="font-medium">{formatGrade(selectedClass.current)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            currentScenario.resultingGrade > selectedClass.current
                              ? "bg-[hsl(var(--chart-2))]"
                              : "bg-[hsl(var(--chart-5))]"
                          } mr-2`}></div>
                          <span>Final Exam Impact</span>
                        </div>
                        <span className={cn(
                          "font-medium",
                          currentScenario.resultingGrade > selectedClass.current
                            ? "text-emerald-500"
                            : currentScenario.resultingGrade < selectedClass.current
                              ? "text-red-500"
                              : ""
                        )}>
                          {currentScenario.resultingGrade > selectedClass.current ? "+" : ""}
                          {formatGrade(currentScenario.resultingGrade - selectedClass.current)}%
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="scenarios" className="space-y-6">
          {classScenarios.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No saved scenarios</h3>
                  <p className="text-muted-foreground mb-4">
                    Save scenarios to compare different final exam outcomes
                  </p>
                  <Button onClick={() => setActiveTab("simulator")}>
                    Create Your First Scenario
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classScenarios.map(scenario => {
                const scenarioClass = classes.find(cls => cls.id === scenario.classId)
                if (!scenarioClass) return null
                
                const gradeChange = scenario.resultingGrade - scenarioClass.current
                
                return (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={cn(
                      "overflow-hidden border-t-4",
                      gradeChange > 0 
                        ? "border-t-emerald-500" 
                        : gradeChange < 0 
                          ? "border-t-red-500" 
                          : "border-t-slate-500"
                    )}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{scenario.name}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              {scenarioClass.name}
                            </CardDescription>
                          </div>
                          <Badge className={getGradeColor(scenario.resultingGrade)}>
                            {getLetterGrade(scenario.resultingGrade)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <div className="text-sm text-muted-foreground">Final Exam Score</div>
                            <div className="text-xl font-bold">{formatGrade(scenario.finalExamScore)}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Resulting Grade</div>
                            <div className="text-xl font-bold">{formatGrade(scenario.resultingGrade)}%</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <div className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            gradeChange > 0 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" 
                              : gradeChange < 0 
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
                                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                          )}>
                            {gradeChange > 0 ? "+" : ""}
                            {formatGrade(gradeChange)}% from current
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-auto"
                          onClick={() => deleteScenario(scenario.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
              <CardDescription>
                Compare your saved scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${formatGrade(Number(value))}%`, "Grade"]}
                        labelFormatter={(label) => `Scenario: ${label}`}
                      />
                      <Legend />
                      <Bar 
                        dataKey="grade" 
                        name="Final Grade" 
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      >
                        {barData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.current ? "hsl(var(--primary))" : "hsl(var(--chart-2))"}
                            stroke={entry.current ? "hsl(var(--primary))" : "hsl(var(--chart-2))"}
                            strokeWidth={entry.current ? 2 : 0}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      {selectedClassId
                        ? "No scenarios saved for this class yet"
                        : "Select a class and save scenarios to compare them"}
                    </p>
                    {selectedClassId && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setActiveTab("simulator")}
                      >
                        Create Scenarios
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
