'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  skills: string[];
  totalCapacity: number;
  hourlyRate: number;
  startDate: string;
  manager: string;
  isActive: boolean;
  profileImageUrl?: string;
}

export default function EditResourcePage() {
  const router = useRouter();
  const params = useParams();
  const resourceId = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    skills: [] as string[],
    totalCapacity: 40,
    hourlyRate: '',
    startDate: '',
    manager: '',
    isActive: true,
    profileImageUrl: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isValidImage, setIsValidImage] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [loading, setLoading] = useState(true);

  // Load existing resource data
  useEffect(() => {
    if (resourceId) {
      // Mock data - in a real app, this would fetch from API
      const mockResource: TeamMember = {
        id: resourceId,
        name: `Team Member ${resourceId.split('-')[1]}`,
        email: `member${resourceId.split('-')[1]}@company.com`,
        role: 'Senior Developer',
        department: 'Engineering',
        skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
        totalCapacity: 40,
        hourlyRate: 75,
        startDate: '2024-01-15',
        manager: 'John Smith',
        isActive: true,
        profileImageUrl: `https://images.unsplash.com/photo-${1500000000000 + parseInt(resourceId.split('-')[1])}?w=100&h=100&fit=crop&crop=face`,
      };

      setFormData({
        name: mockResource.name,
        email: mockResource.email,
        role: mockResource.role,
        department: mockResource.department,
        skills: mockResource.skills,
        totalCapacity: mockResource.totalCapacity,
        hourlyRate: mockResource.hourlyRate.toString(),
        startDate: mockResource.startDate,
        manager: mockResource.manager,
        isActive: mockResource.isActive,
        profileImageUrl: mockResource.profileImageUrl || '',
      });

      if (mockResource.profileImageUrl) {
        setProfileImageUrl(mockResource.profileImageUrl);
        setIsValidImage(true);
      }

      setLoading(false);
    }
  }, [resourceId]);

  const validateImageUrl = async (url: string) => {
    if (!url.trim()) {
      setIsValidImage(false);
      setImageError('');
      setFormData({ ...formData, profileImageUrl: '' });
      return;
    }

    setImageLoading(true);
    setImageError('');

    try {
      const img = new Image();
      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error('Invalid image URL'));
        img.src = url;
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Image load timeout')), 10000);
      });

      await Promise.race([imageLoadPromise, timeoutPromise]);

      setIsValidImage(true);
      setFormData({ ...formData, profileImageUrl: url });
    } catch (error) {
      setIsValidImage(false);
      setFormData({ ...formData, profileImageUrl: '' });
      setImageError('Invalid image URL. Please provide a valid image link.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setProfileImageUrl(url);
    const timeoutId = setTimeout(() => validateImageUrl(url), 500);
    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the resource in the database
    console.log('Updating resource:', formData);
    router.push(`/project/resources/${resourceId}`);
  };

  const handleCancel = () => {
    router.push(`/project/resources/${resourceId}`);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const predefinedSkills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++', 'Go', 'Rust',
    'UI/UX Design', 'Figma', 'Photoshop', 'Illustrator', 'Sketch',
    'Testing', 'Automation', 'Selenium', 'Cypress', 'Jest',
    'AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
    'Project Management', 'Agile', 'Scrum', 'Kanban',
    'Data Analysis', 'SQL', 'MongoDB', 'PostgreSQL',
    'DevOps', 'Linux', 'Git', 'Jenkins'
  ];

  const roles = [
    'Project Manager', 'Senior Developer', 'Developer', 'Junior Developer',
    'Senior Designer', 'Designer', 'QA Engineer', 'DevOps Engineer',
    'Business Analyst', 'Product Manager', 'Technical Lead', 'Architect'
  ];

  const departments = [
    'Engineering', 'Design', 'Quality Assurance', 'DevOps',
    'Product', 'Operations', 'Management', 'Data'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resource data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Resource</h1>
          <p className="text-gray-600 mt-1">Update resource information and details</p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="profileImageUrl">Profile Image URL</Label>
              <Input
                id="profileImageUrl"
                type="url"
                value={profileImageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/profile-image.jpg"
              />
              {imageLoading && (
                <p className="text-sm text-blue-600 mt-1">Validating image URL...</p>
              )}
              {imageError && (
                <p className="text-sm text-red-600 mt-1">{imageError}</p>
              )}
              {isValidImage && !imageLoading && (
                <p className="text-sm text-green-600 mt-1">✓ Valid image URL</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
              />
              <Label htmlFor="isActive">Active resource</Label>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Skills</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  Add
                </Button>
              </div>

              {/* Predefined skills */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {predefinedSkills.slice(0, 12).map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!formData.skills.includes(skill)) {
                          setFormData({
                            ...formData,
                            skills: [...formData.skills, skill]
                          });
                        }
                      }}
                      className="text-xs"
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected skills */}
              {formData.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Capacity & Compensation */}
        <Card>
          <CardHeader>
            <CardTitle>Capacity & Compensation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalCapacity">Weekly Capacity (hours) *</Label>
                <Input
                  id="totalCapacity"
                  type="number"
                  value={formData.totalCapacity}
                  onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value) || 40 })}
                  min="1"
                  max="80"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Typical full-time capacity is 40 hours/week</p>
              </div>

              <div>
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  placeholder="Enter hourly rate"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="manager">Manager/Supervisor</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="Enter manager name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {formData.name && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 bg-purple-600 text-white">
                  {isValidImage && formData.profileImageUrl ? (
                    <AvatarImage src={formData.profileImageUrl} alt={formData.name} />
                  ) : null}
                  <AvatarFallback className="text-lg">
                    {formData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{formData.name}</h3>
                  <p className="text-gray-600">{formData.role} • {formData.department}</p>
                  <p className="text-sm text-gray-500">{formData.email}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {formData.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{formData.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
            Update Resource
          </Button>
        </div>
      </form>
    </div>
  );
}