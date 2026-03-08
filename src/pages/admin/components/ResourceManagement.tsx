import React, { useState } from 'react';
import { Plus, X, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addResource, deleteResource, uploadFile } from '@/lib/progressService';

interface ResourceManagementProps {
    resources: any[];
    setResources: React.Dispatch<React.SetStateAction<any[]>>;
    resourcesLoading: boolean;
    loadResources: () => Promise<void>;
    profile: any;
}

const ResourceManagement: React.FC<ResourceManagementProps> = ({ resources, setResources, resourcesLoading, loadResources, profile }) => {
    const { toast } = useToast();
    const [newResource, setNewResource] = useState({ title: "", description: "", url: "", category: "", level: "beginner" });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [addLoading, setAddLoading] = useState(false);

    const handleAddResource = async () => {
        if (!newResource.title || (!newResource.url && !selectedFile)) {
            toast({ title: "Error", description: "Title and either a URL or a File are required", variant: "destructive" });
            return;
        }
        setAddLoading(true);
        try {
            let finalUrl = newResource.url;

            if (selectedFile) {
                const path = `resources/${Date.now()}_${selectedFile.name}`;
                finalUrl = await uploadFile(selectedFile, path);
            }

            await addResource({
                ...newResource,
                url: finalUrl,
                createdBy: profile?.name || profile?.email || "Admin"
            });
            toast({ title: "Resource added", description: "The learning material is now live." });
            setNewResource({ title: "", description: "", url: "", category: "", level: "beginner" });
            setSelectedFile(null);
            loadResources();
        } catch (error: any) {
            console.error("Add resource error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to add resource. Check firewall/rules.",
                variant: "destructive"
            });
        } finally {
            setAddLoading(false);
        }
    };

    const handleDeleteResource = async (id: string) => {
        if (!confirm("Delete this resource?")) return;
        try {
            await deleteResource(id);
            toast({ title: "Resource deleted" });
            setResources((r) => r.filter((x) => x.id !== id));
        } catch {
            toast({ title: "Error", description: "Failed to delete resource", variant: "destructive" });
        }
    };

    return (
        <>
            <h2 className="text-xl font-bold font-display mb-1">Manage Resources</h2>
            <p className="text-muted-foreground text-sm mb-6">Add learning materials for students</p>

            {/* Add Resource Form */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add New Resource
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Title *</Label>
                            <Input value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} className="mt-1 h-8 text-sm" />
                        </div>
                        <div>
                            <Label className="text-xs">URL *</Label>
                            <Input value={newResource.url} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} className="mt-1 h-8 text-sm" placeholder="https://..." />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs">File Upload (PDF, Image, Video)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                className="h-9 text-xs py-1 flex-1"
                                accept=".pdf,image/*,video/*"
                            />
                            {selectedFile && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedFile(null)}
                                    className="h-9 px-2 text-destructive shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Or provide a URL below</p>
                    </div>
                    <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea value={newResource.description} onChange={(e) => setNewResource({ ...newResource, description: e.target.value })} className="mt-1 text-sm" rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Category</Label>
                            <Input value={newResource.category} onChange={(e) => setNewResource({ ...newResource, category: e.target.value })} className="mt-1 h-8 text-sm" placeholder="Grammar, Vocabulary..." />
                        </div>
                        <div>
                            <Label className="text-xs">Level</Label>
                            <select value={newResource.level} onChange={(e) => setNewResource({ ...newResource, level: e.target.value })} className="mt-1 w-full h-8 rounded-md border border-border bg-secondary/50 px-2 text-sm">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                    <Button onClick={handleAddResource} className="gradient-button" disabled={addLoading}>
                        {addLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                        {addLoading ? "Adding..." : "Add Resource"}
                    </Button>
                </CardContent>
            </Card>

            {/* Resource List */}
            {resourcesLoading ? (
                <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
            ) : resources.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No resources yet. Add one above!</p>
            ) : (
                <div className="space-y-3">
                    {resources.map((r) => (
                        <Card key={r.id}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <h4 className="text-sm font-semibold">{r.title}</h4>
                                    <p className="text-xs text-muted-foreground">{r.category} • {r.level}</p>
                                    {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm"><ExternalLink className="w-3 h-3" /></Button>
                                    </a>
                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteResource(r.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
};

export default ResourceManagement;
