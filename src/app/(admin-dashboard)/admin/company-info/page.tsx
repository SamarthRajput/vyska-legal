"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

export default function CompanyInfoPage() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        whatsapp: "",
        address: "",
        instagramUrl: "",
        linkedinUrl: "",
        twitterUrl: "",
        facebookUrl: "",
        yearsExperience: "",
        successRate: "",
        trustedClients: "",
        casesWon: "",
        // New Fields
        headOffice: "",
        mapUrl: "",
        disclaimerMessage: "",
        disclaimerPoints: [] as string[],
    });

    const fetchInfo = async () => {
        try {
            const res = await fetch("/api/admin/company-info");
            if (!res.ok) throw new Error("Failed to fetch data");
            const data = await res.json();
            if (data && data.id) {
                setFormData({
                    email: data.email || "",
                    phone: data.phone || "",
                    whatsapp: data.whatsapp || "",
                    address: data.address || "",
                    instagramUrl: data.instagramUrl || "",
                    linkedinUrl: data.linkedinUrl || "",
                    twitterUrl: data.twitterUrl || "",
                    facebookUrl: data.facebookUrl || "",
                    yearsExperience: data.yearsExperience || "",
                    successRate: data.successRate || "",
                    trustedClients: data.trustedClients || "",
                    casesWon: data.casesWon || "",
                    headOffice: data.headOffice || "",
                    mapUrl: data.mapUrl || "",
                    disclaimerMessage: data.disclaimerMessage || "",
                    disclaimerPoints: data.disclaimerPoints || [],
                });
            }
        } catch (error) {
            toast.error("Failed to load company info");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInfo();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/company-info", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Operation failed");
            toast.success("Settings updated successfully");
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePointChange = (index: number, value: string) => {
        const newPoints = [...formData.disclaimerPoints];
        newPoints[index] = value;
        setFormData({ ...formData, disclaimerPoints: newPoints });
    };

    const addPoint = () => {
        setFormData({ ...formData, disclaimerPoints: [...formData.disclaimerPoints, ""] });
    };

    const removePoint = (index: number) => {
        const newPoints = formData.disclaimerPoints.filter((_, i) => i !== index);
        setFormData({ ...formData, disclaimerPoints: newPoints });
    };

    if (loading) return (
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
                <p className="text-gray-500">Manage your contact details, social links, stats, and legal info.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Details */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-blue-900">Contact Details</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                            <Input
                                id="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-500">Displayed in footer and contact page.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-500">Displayed in footer and contact page.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp Number</Label>
                            <Input
                                id="whatsapp"
                                value={formData.whatsapp}
                                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                placeholder="e.g. +91 9876543210"
                            />
                            <p className="text-xs text-gray-500">Optional. Only meant for direct messaging links.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="headOffice">Head Office Location</Label>
                            <Input
                                id="headOffice"
                                value={formData.headOffice}
                                onChange={e => setFormData({ ...formData, headOffice: e.target.value })}
                                placeholder="e.g. New Delhi"
                            />
                            <p className="text-xs text-gray-500">The city/label shown above the address in the footer.</p>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="address">Full Office Address <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-500">Full address displayed in the contact page.</p>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="mapUrl">Google Maps Embed URL</Label>
                            <Input
                                id="mapUrl"
                                value={formData.mapUrl}
                                onChange={e => setFormData({ ...formData, mapUrl: e.target.value })}
                                placeholder="https://www.google.com/maps/embed?..."
                            />
                            <p className="text-xs text-gray-500">
                                <strong>How to get this:</strong> Go to Google Maps {'>'} Share {'>'} Embed a map {'>'} Copy HTML {'>'} Paste <strong>only the link inside `src="..."`</strong> here.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Social Links */}
                <section className="space-y-4 pt-4 border-t">
                    <h2 className="text-xl font-semibold text-blue-900">Social Media</h2>
                    <p className="text-sm text-gray-500 -mt-3">Leave fields empty to hide the corresponding icons from the footer.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="instagram">Instagram URL</Label>
                            <Input
                                id="instagram"
                                value={formData.instagramUrl}
                                onChange={e => setFormData({ ...formData, instagramUrl: e.target.value })}
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn URL</Label>
                            <Input
                                id="linkedin"
                                value={formData.linkedinUrl}
                                onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="twitter">Twitter / X URL</Label>
                            <Input
                                id="twitter"
                                value={formData.twitterUrl}
                                onChange={e => setFormData({ ...formData, twitterUrl: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="facebook">Facebook URL</Label>
                            <Input
                                id="facebook"
                                value={formData.facebookUrl}
                                onChange={e => setFormData({ ...formData, facebookUrl: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="space-y-4 pt-4 border-t">
                    <h2 className="text-xl font-semibold text-blue-900">Key Statistics</h2>
                    <p className="text-sm text-gray-500 -mt-3">These numbers appear on the landing page/about section.</p>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="exp">Years Experience</Label>
                            <Input
                                id="exp"
                                value={formData.yearsExperience}
                                onChange={e => setFormData({ ...formData, yearsExperience: e.target.value })}
                                placeholder="25+"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="success">Success Rate</Label>
                            <Input
                                id="success"
                                value={formData.successRate}
                                onChange={e => setFormData({ ...formData, successRate: e.target.value })}
                                placeholder="98%"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clients">Trusted Clients</Label>
                            <Input
                                id="clients"
                                value={formData.trustedClients}
                                onChange={e => setFormData({ ...formData, trustedClients: e.target.value })}
                                placeholder="150+"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cases">Cases Won</Label>
                            <Input
                                id="cases"
                                value={formData.casesWon}
                                onChange={e => setFormData({ ...formData, casesWon: e.target.value })}
                                placeholder="500+"
                            />
                        </div>
                    </div>
                </section>

                {/* Disclaimer Settings */}
                <section className="space-y-4 pt-4 border-t">
                    <h2 className="text-xl font-semibold text-blue-900">Legal Disclaimer</h2>
                    <p className="text-sm text-gray-500 -mt-3">Controls the content of the "I Agree" modal shown to first-time visitors.</p>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="disclaimerMessage">Disclaimer Message</Label>
                            <Textarea
                                id="disclaimerMessage"
                                value={formData.disclaimerMessage}
                                onChange={e => setFormData({ ...formData, disclaimerMessage: e.target.value })}
                                placeholder="Main disclaimer text..."
                                className="min-h-[100px]"
                            />
                            <p className="text-xs text-gray-500">The introductory paragraph at the top of the modal.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Disclaimer Points</Label>
                            <div className="space-y-2">
                                {formData.disclaimerPoints.map((point, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={point}
                                            onChange={(e) => handlePointChange(index, e.target.value)}
                                            placeholder={`Point ${index + 1}`}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => removePoint(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addPoint}
                                    className="gap-2 mt-2"
                                >
                                    <Plus className="w-4 h-4" /> Add Point
                                </Button>
                                <p className="text-xs text-gray-500 pt-1">Add individual bullet points to list specific legal terms.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pt-6 border-t flex justify-end">
                    <Button type="submit" size="lg" disabled={submitting}>
                        {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
