import { useState } from "react"
import { User, Camera, Lock, Shield, Phone, Calendar, Languages, MapPin, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

export default function AccountSettings() {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    homeNumber: "",
    birthDate: "",
    pronouns: "",
    punchId: "",
    language: "english",
    emergencyContactName: "",
    emergencyContactNumber: "",
    appearAsEmployee: false
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          <h1 className="text-xl font-semibold">My Account</h1>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal information and contact details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name (required)</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name (required)</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile number</Label>
                        <div className="flex">
                          <Select defaultValue="us">
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us">🇺🇸</SelectItem>
                              <SelectItem value="ca">🇨🇦</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            id="mobile"
                            value={profileData.mobileNumber}
                            onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                            placeholder="+1"
                            className="ml-2"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Area code is required for text messaging.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="home">Home number</Label>
                        <div className="flex">
                          <Select defaultValue="us">
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us">🇺🇸</SelectItem>
                              <SelectItem value="ca">🇨🇦</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            id="home"
                            value={profileData.homeNumber}
                            onChange={(e) => handleInputChange("homeNumber", e.target.value)}
                            placeholder="+1"
                            className="ml-2"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Birth date</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={profileData.birthDate}
                          onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pronouns">Pronouns</Label>
                        <Select
                          value={profileData.pronouns}
                          onValueChange={(value) => handleInputChange("pronouns", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Prefer not to share" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="he/him">He/Him</SelectItem>
                            <SelectItem value="she/her">She/Her</SelectItem>
                            <SelectItem value="they/them">They/Them</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="none">Prefer not to share</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="punchId">Punch ID</Label>
                        <Input
                          id="punchId"
                          value={profileData.punchId}
                          onChange={(e) => handleInputChange("punchId", e.target.value)}
                          placeholder="Enter punch ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={profileData.language}
                          onValueChange={(value) => handleInputChange("language", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyName">Contact name</Label>
                        <Input
                          id="emergencyName"
                          value={profileData.emergencyContactName}
                          onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                          placeholder="Enter contact name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyNumber">Contact number</Label>
                        <Input
                          id="emergencyNumber"
                          value={profileData.emergencyContactNumber}
                          onChange={(e) => handleInputChange("emergencyContactNumber", e.target.value)}
                          placeholder="Enter contact number"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="appearAsEmployee"
                        checked={profileData.appearAsEmployee}
                        onCheckedChange={(checked) => handleInputChange("appearAsEmployee", checked)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="appearAsEmployee"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Appear as employee
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Appearing as an employee makes you appear on schedules.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Photo & Security */}
              <div className="space-y-6">
                {/* Profile Photo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Profile photo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-lg">
                        <User className="w-12 h-12" />
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="w-full">
                      Upload photo
                    </Button>
                  </CardContent>
                </Card>

                {/* Login & Security */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Login & Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Password</Label>
                      <p className="text-sm text-muted-foreground mb-2">••••••••••</p>
                      <Button variant="outline" size="sm">
                        Change password
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium">Authentication</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox id="twoFactor" />
                        <Label htmlFor="twoFactor" className="text-sm">
                          Enable 2-step verification
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about important updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="emailNotifs" defaultChecked />
                    <Label htmlFor="emailNotifs">Email notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="smsNotifs" />
                    <Label htmlFor="smsNotifs">SMS notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pushNotifs" defaultChecked />
                    <Label htmlFor="pushNotifs">Push notifications</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Permissions</CardTitle>
                <CardDescription>
                  View your current permissions and access levels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">View schedules</span>
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Manage employees</span>
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Access reports</span>
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}