"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ArrowUp, ArrowDown, Minus, Calendar, TrendingUp, TrendingDown, History } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { GradeClass } from "@/types/grade-calculator"

type GradeSnapshot = {
  id: string
  date: string
  classes: Array<{
    id: string
    name: string
    grade: number
    color: string
  }>
}

type GradeHistoryProps = {
  classes: GradeClass[]
  formatGrade: (grade: number) => string
}

export default function GradeHistory({ classes, formatGrade }: GradeHistoryProps) {
  const { toast } = useToast()
  const [snapshots, setSnapshots] = useLocalStorage<GradeSnapshot[]>("grade-history-snapshots", [])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    classes.length > 0 ? classes[0].id : null
  )
  
  // Take a snapshot of current grades
  const takeSnapshot = () => {
    const today = new Date().toISOString().split("T")[0]
    
    // Check if we already have a snapshot for today
    const existingSnapshot = snapshots.find(snapshot => snapshot.date === today)
    
    if (existingSnapshot) {
      // Update existing snapshot
      setSnapshots(
        snapshots.map(snapshot => 
          snapshot.id === existingSnapshot.id
            ? {
                ...snapshot,
                classes: classes.map(cls => ({
                  id: cls.id,
                  name: cls.name,
                  grade: cls.current,
                  color: cls.color,
                }))
              }
            : snapshot
        )
      )
      
      toast({
        title: "Snapshot updated",
        description: "Today's grade snapshot has been updated",
      })
    } else {
      // Create new snapshot
      const newSnapshot: GradeSnapshot = {
        id: Math.random().toString(36).substring(2, 9),
        date: today,
        classes: classes.map(cls => ({
          id: cls.id,
          name: cls.name,
          grade: cls.current,
          color: cls.color,
        }))
      }
      
      setSnapshots([...snapshots, newSnapshot])
      
      toast({
        title: "Snapshot taken",
        description: "Your current grades have been saved",
      })
    }
  }
  
  const deleteSnapshot = (id: string) => {
    setSnapshots(snapshots.filter(snapshot => snapshot.id !== id))
    
    toast({
      title: "Snapshot deleted",
      description: "The grade snapshot has been removed",
    })
  }
  
  const getClassHistory = (classId: string) => {
    return snapshots
      .filter(snapshot => snapshot.classes.some(cls => cls.id === classId))
      .map(snapshot => {
        const classData = snapshot.classes.find(cls => cls.id === classId)
        return {
          date: snapshot.date,
          grade: classData?.grade || 0,
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }
  
  const getGradeChange = (classId: string) => {
    const history = getClassHistory(classId)
    
    if (history.length < 2) return { change: 0, trend: "neutral" }
    
    const oldest = history[0].grade
    const newest = history[history.length - 1].grade
    const change = newest - oldest
    
    return {
      change,
      trend: change > 0 ? "up" : change < 0 ? "down" : "neutral"
    }
  }
  
  const getSelectedClassData = () => {
    if (!selectedClassId) return null
    
    const classHistory = getClassHistory(selectedClassId)
    const currentClass = classes.find(cls => cls.id === selectedClassId)
    const gradeChange = getGradeChange(selectedClassId)
    
    return {
      classInfo: currentClass,
      history: classHistory,
      change: gradeChange,
    }
  }
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d")
  }
  
  const renderTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-4 w-4 text-emerald-500" />
      case "down":
        return <ArrowDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-slate-500" />
    }
  }
  
  const selectedClassData = getSelectedClassData()
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Grade History</h2>
          <p className="text-muted-foreground">Track how your grades change over time</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={selectedClassId || ""}
            onValueChange={setSelectedClassId}
            disabled={classes.length === 0}
          >
            <SelectTrigger className="w-[200px]">
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
          
          <Button onClick={takeSnapshot}>
            Take Snapshot
          </Button>
        </div>
      </div>
      
      {snapshots.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No grade history yet</h3>
              <p className="text-muted-foreground mb-4">
                Take snapshots of your grades to track your progress over time
              </p>
              <Button onClick={takeSnapshot}>
                Take Your First Snapshot
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Grade Progression</CardTitle>
                <CardDescription>
                  {selectedClassData?.classInfo?.name || "Select a class to view its grade history"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {selectedClassData && selectedClassData.history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={selectedClassData.history}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          domain={[
                            Math.max(0, Math.floor(Math.min(...selectedClassData.history.map(h => h.grade)) - 5)),
                            Math.min(100, Math.ceil(Math.max(...selectedClassData.history.map(h => h.grade)) + 5))
                          ]}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value) => [`${formatGrade(Number(value))}%`, "Grade"]}
                          labelFormatter={(label) => format(new Date(label), "PPP")}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="grade"
                          name={selectedClassData.classInfo?.name || "Grade"}
                          stroke={`var(--${selectedClassData.classInfo?.color.replace("bg-", "")})`}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        {selectedClassId
                          ? "No history data available for this class yet"
                          : "Select a class to view its grade history"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Snapshots</CardTitle>
                <CardDescription>
                  Your saved grade snapshots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {snapshots
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(snapshot => (
                      <motion.div
                        key={snapshot.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card>
                          <CardHeader className="py-3 px-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="font-medium">
                                  {format(new Date(snapshot.date), "PPP")}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSnapshot(snapshot.id)}
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Delete</span>
                                <TrendingUp className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="py-0 px-4">
                            <ul className="space-y-1">
                              {snapshot.classes.map(cls => {
                                const change = snapshots
                                  .filter(s => new Date(s.date) < new Date(snapshot.date))
                                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                                  ?.classes.find(c => c.id === cls.id)?.grade;
                                
                                const diff = change !== undefined ? cls.grade - change : 0;
                                const trend = diff > 0 ? "up" : diff < 0 ? "down" : "neutral";
                                
                                return (
                                  <li key={cls.id} className="flex justify-between items-center py-1">
                                    <div className="flex items-center">
                                      <div className={`w-2 h-2 rounded-full ${cls.color} mr-2`}></div>
                                      <span className="text-sm">{cls.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-medium">{formatGrade(cls.grade)}%</span>
                                      {diff !== 0 && (
                                        <Badge variant="outline" className={
                                          trend === "up" 
                                            ? "text-emerald-500 border-emerald-200 dark:border-emerald-800" 
                                            : "text-red-500 border-red-200 dark:border-red-800"
                                        }>
                                          <span className="flex items-center text-xs">
                                            {trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                            {diff > 0 ? "+" : ""}{formatGrade(diff)}
                                          </span>
                                        </Badge>
                                      )}
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
