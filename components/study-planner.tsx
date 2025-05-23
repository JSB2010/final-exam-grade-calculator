"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon, Clock, GraduationCap, Plus, Trash2, CheckCircle2 } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

type StudySession = {
  id: string
  title: string
  classId: string
  date: Date
  duration: number
  completed: boolean
  notes?: string
  priority: "low" | "medium" | "high"
}

type StudyPlannerProps = {
  classes: Array<{
    id: string
    name: string
    color: string
  }>
}

export default function StudyPlanner({ classes }: StudyPlannerProps) {
  const { toast } = useToast()
  const [studySessions, setStudySessions] = useLocalStorage<StudySession[]>("study-planner-sessions", [])
  const [date, setDate] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState("upcoming")
  
  // New session form state
  const [newSession, setNewSession] = useState<Omit<StudySession, "id" | "completed">>({
    title: "",
    classId: classes.length > 0 ? classes[0].id : "",
    date: new Date(),
    duration: 60,
    priority: "medium",
  })
  
  const generateId = () => Math.random().toString(36).substring(2, 9)
  
  const handleAddSession = () => {
    if (!newSession.title || !newSession.classId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    
    const session: StudySession = {
      ...newSession,
      id: generateId(),
      completed: false,
    }
    
    setStudySessions([...studySessions, session])
    
    // Reset form
    setNewSession({
      title: "",
      classId: classes.length > 0 ? classes[0].id : "",
      date: new Date(),
      duration: 60,
      priority: "medium",
    })
    
    toast({
      title: "Study session added",
      description: "Your study session has been scheduled",
    })
  }
  
  const handleToggleComplete = (id: string) => {
    setStudySessions(
      studySessions.map((session) =>
        session.id === id ? { ...session, completed: !session.completed } : session
      )
    )
    
    const session = studySessions.find((s) => s.id === id)
    if (session) {
      toast({
        title: session.completed ? "Session marked as incomplete" : "Session completed",
        description: session.completed 
          ? "You've marked this session as not completed" 
          : "Great job completing your study session!",
      })
    }
  }
  
  const handleDeleteSession = (id: string) => {
    setStudySessions(studySessions.filter((session) => session.id !== id))
    toast({
      title: "Session deleted",
      description: "The study session has been removed from your planner",
    })
  }
  
  const getClassById = (id: string) => {
    return classes.find((cls) => cls.id === id)
  }
  
  const getUpcomingSessions = () => {
    const now = new Date()
    return studySessions
      .filter((session) => !session.completed && new Date(session.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }
  
  const getCompletedSessions = () => {
    return studySessions
      .filter((session) => session.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-amber-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }
  
  const upcomingSessions = getUpcomingSessions()
  const completedSessions = getCompletedSessions()
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Upcoming ({upcomingSessions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Completed ({completedSessions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Session</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming study sessions</h3>
                  <p className="text-muted-foreground mb-4">
                    Plan your study time by adding sessions to your planner
                  </p>
                  <Button onClick={() => setActiveTab("add")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Study Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {upcomingSessions.map((session) => {
                  const classInfo = getClassById(session.classId)
                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden border-t-4" style={{ borderTopColor: `var(--${classInfo?.color.replace("bg-", "")})` }}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{session.title}</CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                <GraduationCap className="h-4 w-4 mr-1" />
                                {classInfo?.name || "Unknown Class"}
                              </CardDescription>
                            </div>
                            <Badge className={getPriorityColor(session.priority)}>
                              {session.priority.charAt(0).toUpperCase() + session.priority.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{format(new Date(session.date), "PPP")}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{session.duration} minutes</span>
                            </div>
                          </div>
                          {session.notes && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <p>{session.notes}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <Button variant="outline" size="sm" onClick={() => handleToggleComplete(session.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteSession(session.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedSessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No completed study sessions</h3>
                  <p className="text-muted-foreground mb-4">
                    Your completed study sessions will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedSessions.map((session) => {
                const classInfo = getClassById(session.classId)
                return (
                  <Card key={session.id} className="overflow-hidden border-t-4 opacity-75" style={{ borderTopColor: `var(--${classInfo?.color.replace("bg-", "")})` }}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            <span className="line-through">{session.title}</span>
                            <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <GraduationCap className="h-4 w-4 mr-1" />
                            {classInfo?.name || "Unknown Class"}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{format(new Date(session.date), "PPP")}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{session.duration} minutes</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleToggleComplete(session.id)}>
                        Unmark Complete
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteSession(session.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add Study Session</CardTitle>
              <CardDescription>
                Plan your study time for upcoming exams and assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Review Chapter 5"
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select
                    value={newSession.classId}
                    onValueChange={(value) => setNewSession({ ...newSession, classId: value })}
                  >
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newSession.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newSession.date ? format(newSession.date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newSession.date}
                        onSelect={(date) => date && setNewSession({ ...newSession, date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newSession.priority}
                  onValueChange={(value: "low" | "medium" | "high") => 
                    setNewSession({ ...newSession, priority: value })
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any additional notes about this study session"
                  value={newSession.notes || ""}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("upcoming")}>
                Cancel
              </Button>
              <Button onClick={handleAddSession}>
                <Plus className="h-4 w-4 mr-2" />
                Add Session
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
