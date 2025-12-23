"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import jsPDF from "jspdf";

// Firebase imports
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

// Icons imports
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  Save,
  Download,
  Building2,
  FileText,
  Package,
  DollarSign,
  FileCheck,
  Handshake,
  CheckCircle,
  Edit,
  Eye,
  X,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Trash2,
  Send,
  Loader2,
  AlertTriangle,
  Upload,
  Link,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Settings,
  Wrench, Check
} from "lucide-react"; // Gear icon ke liye

// Firebase Hooks
const useCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);

        const customersCollection = collection(db, "customers");
        const simpleQuery = query(customersCollection);

        unsubscribe = onSnapshot(
          simpleQuery,
          (querySnapshot) => {
            const customersData: any[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.isActive !== false) {
                customersData.push({
                  id: doc.id,
                  companyName: data.companyName || "",
                  primaryContact: {
                    name: data.primaryContact?.name || "",
                    email: data.primaryContact?.email || "",
                    phone: data.primaryContact?.phone || "",
                    designation: data.primaryContact?.designation || "",
                  },
                  city: data.address?.city || data.city || "",
                  country: data.address?.country || data.country || "",
                  customerType: data.customerType || "",
                  industry: data.industry || "",
                  isActive: data.isActive !== false,
                });
              }
            });

            customersData.sort((a, b) =>
              a.companyName.localeCompare(b.companyName)
            );
            setCustomers(customersData);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching customers:", error);
            setError(error.message);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error in customers hook:", error);
        setError("Failed to load customers");
        setLoading(false);
      }
    };

    fetchCustomers();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { customers, loading, error };
};

const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "products"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const productsData: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            name: data.name || "",
            sellingPrice: data.sellingPrice || 0,
            description: data.description || "",
            currentStock: data.currentStock || 0,
            sku: data.sku || "",
            category: data.category || "",
            status: data.status || "",
            images: data.images || [],
          });
        });

        productsData.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching products:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
};

// Company settings
const companySettings = {
  logoUrl: "https://via.placeholder.com/150x50?text=Company+Logo",
  companyName: "SBR Technologies",
  address: {
    street: "Business Bay",
    city: "Dubai",
    state: "Dubai",
    zipCode: "12345",
    country: "UAE",
  },
  contact: {
    phone: "+971 4 123 4567",
    email: "info@sbrtech.com",
    website: "www.sbrtech.com",
  },
};

// Currency hook
const useCurrency = () => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return { formatAmount };
};

interface QuotationSection {
  id: string;
  type:
  | "cover_page"
  | "executive_summary"
  | "company_introduction"
  | "problem_statement"
  | "solution_details"
  | "product_specifications"
  | "quotation_items"
  | "timeline_schedule"
  | "terms_warranties"
  | "contact_information";
  title: string;
  enabled: boolean;
  order: number;
  data: any;
}

interface ProductDetail {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  description: string;
  images: string[];
}

interface QuotationItem {
  id: string;
  itemId: string;
  productId: string;
  productName: string;
  sku: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  discountType: "percentage" | "fixed";
  tax: number;
  taxType: "percentage" | "fixed";
  serviceCharges: number;
  amount: number;
  images: string[];
  titleId?: string;
  printVisibility?: {
    itemId: boolean;
    sku: boolean;
    productName: boolean;
    description: boolean;
    quantity: boolean;
    rate: boolean;
    discount: boolean;
    tax: boolean;
    amount: boolean;
  };
}

interface QuotationTitle {
  id: string;
  title: string;
}

// Template Definitions - 5 Different Templates
const QUOTATION_TEMPLATES = {
  template1: {
    name: "Template 1",
    coverPage: {
      subject: "Professional Services Proposal",
      salutation: "Dear Valued Client,",
      letterContent: `We are pleased to submit this comprehensive proposal outlining our professional services tailored to meet your business requirements. Our team has meticulously analyzed your needs and developed a solution that aligns with your strategic objectives while ensuring maximum return on investment.

This proposal represents our commitment to delivering exceptional value through innovative solutions and proven methodologies. We are confident that our partnership will drive significant improvements in your operational efficiency and business outcomes.`,
    },
    executiveSummary: {
      summary: `This professional proposal presents a strategic partnership opportunity designed to enhance your operational efficiency and drive business growth. Our solution combines industry best practices with innovative technology to deliver measurable results and sustainable competitive advantages.`,
      keyBenefits: [
        "Strategic partnership with industry experts",
        "Proven methodologies ensuring project success",
        "Scalable solutions supporting long-term growth",
        "Comprehensive support and maintenance",
        "Competitive pricing with clear ROI",
        "Quality assurance and best practices",
      ],
    },
  },
  template2: {
    name: "Template 2",
    coverPage: {
      subject: "Enterprise Solution Proposal",
      salutation: "Dear Executive Team,",
      letterContent: `We present this enterprise-grade solution designed to transform your business operations and drive digital innovation. Our proposal reflects our commitment to delivering world-class technology solutions that empower organizations to achieve their strategic vision and operational excellence.

This enterprise solution is built to handle complex business requirements while maintaining the highest standards of security, scalability, and performance. We look forward to partnering with you in this transformative journey.`,
    },
    executiveSummary: {
      summary: `This enterprise proposal offers a comprehensive technology solution built to scale with your business growth. Our approach combines cutting-edge technology with deep industry expertise to deliver transformative results and enterprise-grade reliability.`,
      keyBenefits: [
        "Enterprise-grade security and compliance",
        "Scalable architecture for business growth",
        "24/7 enterprise support with SLA guarantees",
        "Integration with existing enterprise systems",
        "Dedicated account management team",
        "Advanced analytics and reporting capabilities",
      ],
    },
  },
  template3: {
    name: "Template 3",
    coverPage: {
      subject: "Premium Service Package Proposal",
      salutation: "Dear Esteemed Client,",
      letterContent: `It is with great pleasure that we present our premium service package, meticulously crafted to exceed your expectations. Our premium offering includes exclusive features and personalized services designed to deliver exceptional value and outstanding results that set new standards in the industry.

This premium package represents our highest level of service commitment, featuring white-glove implementation, dedicated resources, and priority access to our innovation pipeline. We are excited about the opportunity to deliver unparalleled value to your organization.`,
    },
    executiveSummary: {
      summary: `Our premium service package represents the pinnacle of quality and innovation in the industry. We offer exclusive features, white-glove service, and unparalleled support to ensure your complete satisfaction and business success.`,
      keyBenefits: [
        "Premium features and exclusive access",
        "White-glove implementation service",
        "Dedicated premium support team",
        "Priority feature development requests",
        "Executive business reviews and strategy sessions",
        "Custom training and knowledge transfer",
      ],
    },
  },
  template4: {
    name: "Template 4",
    coverPage: {
      subject: "Standard Service Proposal",
      salutation: "Dear Client,",
      letterContent: `Thank you for considering our standard service package. This proposal outlines a reliable and cost-effective solution that addresses your core business needs while maintaining high quality standards and delivering excellent value for your investment.

Our standard package provides all the essential features you need to achieve your business objectives without unnecessary complexity. We are committed to ensuring your success through reliable service and consistent performance.`,
    },
    executiveSummary: {
      summary: `Our standard package provides essential features and reliable service at an affordable price point. This solution is perfect for businesses looking for quality service without unnecessary complexity or premium costs.`,
      keyBenefits: [
        "Cost-effective solution with great value",
        "Essential features for business operations",
        "Reliable performance and uptime",
        "Standard support during business hours",
        "Easy to implement and use",
        "Proven track record of success",
      ],
    },
  },
  template5: {
    name: "Template 5",
    coverPage: {
      subject: "Custom Tailored Solution Proposal",
      salutation: "Dear Partner,",
      letterContent: `Based on our detailed discussions and analysis of your unique requirements, we are excited to present this custom-tailored solution. This proposal reflects our collaborative approach and commitment to addressing your specific business challenges with precision and innovation.

This custom solution has been designed specifically for your organization, taking into account your unique workflows, integration requirements, and strategic objectives. We look forward to building this solution together and creating lasting value for your business.`,
    },
    executiveSummary: {
      summary: `This custom solution is specifically designed to address your unique business needs and challenges. Through our collaborative approach, we have developed a tailored strategy that aligns perfectly with your organizational goals and technical requirements.`,
      keyBenefits: [
        "Fully customized to your specific needs",
        "Flexible and adaptable solution architecture",
        "Collaborative development approach",
        "Ongoing customization and refinement",
        "Strategic partnership for long-term success",
        "Tailored integration with existing systems",
      ],
    },
  },
};

// Image Upload Component
const ImageUploader = ({
  images,
  onImagesChange,
  multiple = false,
  maxImages = 10,
}: {
  images: string[];
  onImagesChange: (images: string[]) => void;
  multiple?: boolean;
  maxImages?: number;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (
    base64: string,
    quality: number = 0.7
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;

        let { width, height } = img;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(base64);
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: string[] = [];

    for (const file of Array.from(files).slice(0, maxImages - images.length)) {
      if (file.type.startsWith("image/")) {
        try {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });

          const compressedBase64 = await compressImage(base64);
          newImages.push(compressedBase64);
        } catch (error) {
          console.error("Error processing image:", error);
        }
      }
    }

    const updatedImages = multiple ? [...images, ...newImages] : newImages;
    onImagesChange(updatedImages.slice(0, maxImages));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddFromURL = () => {
    const url = prompt("Enter image URL:");
    if (url && url.trim()) {
      const updatedImages = multiple ? [...images, url.trim()] : [url.trim()];
      onImagesChange(updatedImages.slice(0, maxImages));
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_: any, i: number) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Uploaded ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
              onClick={() => removeImage(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {images.length < maxImages && (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-20 h-20 flex flex-col items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-6 w-6 mb-1" />
              <span className="text-xs">Upload</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-20 h-10 flex items-center justify-center"
              onClick={handleAddFromURL}
            >
              <Link className="h-4 w-4 mr-1" />
              <span className="text-xs">URL</span>
            </Button>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        multiple={multiple}
        className="hidden"
      />

      {multiple && images.length < maxImages && (
        <p className="text-xs text-gray-500">
          {images.length}/{maxImages} images. You can upload{" "}
          {maxImages - images.length} more.
        </p>
      )}
    </div>
  );
};

// Firebase functions
const saveQuotationToFirebase = async (quotationData: any): Promise<string> => {
  try {
    const cleanData = JSON.parse(JSON.stringify(quotationData));

    const firebaseData = {
      ...cleanData,
      sections: cleanData.sections?.map((section: any) => ({
        ...section,
        data:
          section.data && typeof section.data === "object" ? section.data : {},
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "quotations"), firebaseData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving quotation to Firebase:", error);
    throw error;
  }
};

const updateQuotationInFirebase = async (
  quotationId: string,
  quotationData: any
): Promise<void> => {
  try {
    const cleanData = JSON.parse(JSON.stringify(quotationData));
    const docRef = doc(db, "quotations", quotationId);

    const firebaseData = {
      ...cleanData,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(docRef, firebaseData);
  } catch (error) {
    console.error("Error updating quotation in Firebase:", error);
    throw error;
  }
};

const loadQuotationFromFirebase = async (quotationId: string): Promise<any> => {
  try {
    const docRef = doc(db, "quotations", quotationId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Quotation not found");
    }
  } catch (error) {
    console.error("Error loading quotation from Firebase:", error);
    throw error;
  }
};

// Updated PDF Generation Function with Selected Services
// Updated PDF Generation Function with Numbering for Titles
const generatePDFWithImages = async (
  quotationData: any,
  sections: QuotationSection[],
  customers: any[],
  products: any[],
  formatAmount: (amount: number) => string,
  selectedServices: { [key: string]: { [serviceId: string]: boolean } },
  serviceDetails: { [key: string]: any[] }
) => {
  const pdf = new jsPDF("p", "mm", "a4");
  let currentPage = 1;
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Create a 5-column grid system for proper alignment
  const createGridColumns = (numColumns: number) => {
    const columnWidth = contentWidth / numColumns;
    const columns = [];
    for (let i = 0; i < numColumns; i++) {
      columns.push(margin + i * columnWidth);
    }
    return columns;
  };

  // Table grid: 5 columns [Sr.no., Description, Qty, Unit Price, Amount]
  const tableColumns = createGridColumns(5);

  // Summary table grid: 2 columns [Label, Value]
  const summaryColumns = createGridColumns(2);
  let yPosition = margin;

  const enabledSections = sections.filter((s) => s.enabled);
  const customer = customers.find((c) => c.id === quotationData.customerId);

  // Function to add blue border to each page
  const addPageBorder = () => {
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(1.5);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
  };

  // Function to add image to PDF
  const addImageToPDF = async (
    imageUrl: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (y + height > pageHeight - margin) {
        pdf.addPage();
        currentPage++;
        yPosition = margin;
        addPageBorder();
        resolve();
        return;
      }

      try {
        if (imageUrl.startsWith("data:")) {
          pdf.addImage(imageUrl, "JPEG", x, y, width, height);
        } else {
          pdf.addImage(imageUrl, "JPEG", x, y, width, height);
        }
        resolve();
      } catch (error) {
        console.error("Error adding image to PDF:", error);
        pdf.rect(x, y, width, height);
        pdf.text("Image not available", x + 5, y + height / 2);
        resolve();
      }
    });
  };

  // Function to add multiple images in a grid
  const addImageGrid = async (
    images: string[],
    maxPerRow: number = 2,
    imageWidth: number = 80,
    imageHeight: number = 60
  ) => {
    if (!images || images.length === 0) return;

    for (let i = 0; i < images.length; i++) {
      const row = Math.floor(i / maxPerRow);
      const col = i % maxPerRow;

      const x = margin + col * (imageWidth + 10);
      const y = yPosition + row * (imageHeight + 10);

      if (y + imageHeight > pageHeight - margin) {
        pdf.addPage();
        currentPage++;
        yPosition = margin;
        addPageBorder();
        const newRow = Math.floor(i / maxPerRow);
        const newCol = i % maxPerRow;
        await addImageToPDF(
          images[i],
          margin + newCol * (imageWidth + 10),
          yPosition + newRow * (imageHeight + 10),
          imageWidth,
          imageHeight
        );
      } else {
        await addImageToPDF(images[i], x, y, imageWidth, imageHeight);
      }
    }

    const totalRows = Math.ceil(images.length / maxPerRow);
    yPosition += totalRows * (imageHeight + 10) + 10;
  };

  const addTextWithPageBreak = (
    text: string,
    fontSize: number = 12,
    isBold: boolean = false,
    lineHeight: number = 7
  ) => {
    pdf.setFontSize(fontSize);
    pdf.setFont(isBold ? "helvetica" : "helvetica", isBold ? "bold" : "normal");

    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);

    for (let i = 0; i < lines.length; i++) {
      if (yPosition + lineHeight > pageHeight - margin) {
        pdf.addPage();
        currentPage++;
        yPosition = margin;
        addPageBorder();
      }
      pdf.text(lines[i], margin, yPosition);
      yPosition += lineHeight;
    }
    yPosition += 2;
  };

  // Section Header with Blue Background
  const addSectionHeader = (title: string, number?: number) => {
    if (yPosition + 20 > pageHeight - margin) {
      pdf.addPage();
      currentPage++;
      yPosition = margin;
      addPageBorder();
    }

    pdf.setFillColor(59, 130, 246);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 12, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");

    // ✅ Add numbering to title (e.g., "1. QUOTATION DETAILS", "2. HARDWARE", etc.)
    const titleWithNumber =
      number !== undefined ? `${number}. ${title}` : title;
    pdf.text(titleWithNumber, margin + 5, yPosition + 8);

    yPosition += 15;
    pdf.setTextColor(0, 0, 0);
  };

  // Add border to first page
  addPageBorder();

  // Process only quotation items section
  const quotationSection = enabledSections.find(
    (s) => s.type === "quotation_items"
  );

  if (quotationSection) {
    // Professional quotation header WITH NUMBERING
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("QUOTATION DETAILS", margin, yPosition);
    yPosition += 15;

    if (quotationSection.data.items && quotationSection.data.items.length > 0) {
      // Filter out deleted items for PDF
      const visibleItems = quotationSection.data.items.filter(
        (item: QuotationItem) => {
          return !quotationData.deletedFields?.[item.id];
        }
      );

      if (
        quotationSection.data.titles &&
        quotationSection.data.titles.length > 0
      ) {
        const visibleTitles = quotationSection.data.titles.filter(
          (title: QuotationTitle) => {
            return !quotationData.deletedFields?.[title.id];
          }
        );

        let titleCounter = 1; // ✅ Start counting from 1

        for (const title of visibleTitles) {
          const titleItems = visibleItems.filter(
            (item: QuotationItem) => item.titleId === title.id
          );

          if (titleItems.length > 0) {
            // Determine visible columns based on printVisibility of first item
            const firstItem = titleItems[0];
            const printVisibility = firstItem.printVisibility || {
              itemId: true,
              sku: true,
              productName: true,
              description: true,
              quantity: true,
              rate: true,
              discount: true,
              tax: true,
              amount: true,
            };

            // Define available columns
            const availableColumns = [
              { key: "itemId", label: "number", width: 0.1 },
              { key: "sku", label: "part", width: 0.15 },
              { key: "productName", label: "Product", width: 0.25 },
              { key: "description", label: "Description", width: 0.2 },
              { key: "quantity", label: "Qty", width: 0.08 },
              { key: "rate", label: "Rate", width: 0.12 },
              { key: "discount", label: "Disc", width: 0.08 },
              { key: "tax", label: "Tax", width: 0.08 },
              { key: "amount", label: "Amount", width: 0.12 },
            ];

            // Filter visible columns
            const visibleColumns = availableColumns.filter(
              (col) => printVisibility[col.key as keyof typeof printVisibility]
            );

            // Calculate column positions
            const titleColumns: number[] = [];
            let currentX = margin;
            for (const col of visibleColumns) {
              titleColumns.push(currentX);
              currentX += col.width * contentWidth;
            }

            // Check if we need new page for section
            if (yPosition + 60 > pageHeight - margin) {
              pdf.addPage();
              currentPage++;
              yPosition = margin;
              addPageBorder();
            }

            // ✅ Section header with NUMBERING (e.g., "1. HARDWARE", "2. SOFTWARE", etc.)
            pdf.setFillColor(59, 130, 246);
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, "F");

            // ✅ Add numbering before title
            pdf.text(
              `${titleCounter}. ${title.title.toUpperCase()}`,
              margin + 5,
              yPosition + 7
            );
            yPosition += 15;
            pdf.setTextColor(0, 0, 0);

            // Table headers - Dynamic layout
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.setFillColor(240, 240, 240);
            pdf.rect(margin, yPosition, contentWidth, 12, "F");

            // Dynamic column headers
            visibleColumns.forEach((col, colIndex) => {
              const alignOffset =
                col.key === "quantity" ||
                  col.key === "rate" ||
                  col.key === "discount" ||
                  col.key === "tax" ||
                  col.key === "amount"
                  ? 10
                  : 2;
              pdf.text(
                col.label,
                titleColumns[colIndex] + alignOffset,
                yPosition + 8
              );
            });
            yPosition += 15;

            // Draw table border
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(margin, yPosition - 15, contentWidth, 12);

            // Table rows
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);

            let sectionTotal = 0;

            for (const [index, item] of titleItems.entries()) {
              if (yPosition + 60 > pageHeight - margin) {
                pdf.addPage();
                currentPage++;
                yPosition = margin;
                addPageBorder();

                // Repeat section header on new page WITH NUMBERING
                pdf.setFillColor(59, 130, 246);
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bold");
                pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, "F");

                // ✅ Repeat with numbering on new page
                pdf.text(
                  `${titleCounter}. ${title.title.toUpperCase()}`,
                  margin + 5,
                  yPosition + 7
                );
                yPosition += 15;
                pdf.setTextColor(0, 0, 0);

                // Repeat table headers dynamically
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "bold");
                pdf.setFillColor(240, 240, 240);
                pdf.rect(margin, yPosition, contentWidth, 12, "F");
                visibleColumns.forEach((col, colIndex) => {
                  const alignOffset =
                    col.key === "quantity" ||
                      col.key === "rate" ||
                      col.key === "discount" ||
                      col.key === "tax" ||
                      col.key === "amount"
                      ? 10
                      : 2;
                  pdf.text(
                    col.label,
                    titleColumns[colIndex] + alignOffset,
                    yPosition + 8
                  );
                });
                yPosition += 15;
              }

              // Alternating row background
              if (index % 2 === 0) {
                pdf.setFillColor(250, 250, 250);
                pdf.rect(
                  margin,
                  yPosition - 2,
                  pageWidth - 2 * margin,
                  10,
                  "F"
                );
              }

              // Row data with dynamic columns
              visibleColumns.forEach((col, colIndex) => {
                let cellValue = "";
                const alignOffset =
                  col.key === "quantity" ||
                    col.key === "rate" ||
                    col.key === "discount" ||
                    col.key === "tax" ||
                    col.key === "amount"
                    ? 10
                    : 2;

                switch (col.key) {
                  case "itemId":
                    cellValue = item.itemId;
                    break;
                  case "sku":
                    cellValue = item.sku || "";
                    break;
                  case "productName":
                    cellValue = item.productName || "";
                    break;
                  case "description":
                    cellValue = item.description || "";
                    break;
                  case "quantity":
                    cellValue = item.quantity.toString();
                    break;
                  case "rate":
                    cellValue = formatAmount(item.rate);
                    break;
                  case "discount":
                    cellValue = `${item.discount}${item.discountType === "percentage" ? "%" : ""
                      }`;
                    break;
                  case "tax":
                    cellValue = `${item.tax}${item.taxType === "percentage" ? "%" : ""
                      }`;
                    break;
                  case "amount":
                    const lineTotal =
                      item.quantity *
                      item.rate *
                      (1 - item.discount / 100) *
                      (1 + item.tax / 100);
                    cellValue = formatAmount(lineTotal);
                    sectionTotal += lineTotal;
                    break;
                }

                pdf.text(
                  cellValue.substring(
                    0,
                    Math.floor((col.width * contentWidth) / 3)
                  ),
                  titleColumns[colIndex] + alignOffset,
                  yPosition + 5
                );
              });

              yPosition += 10;

              // Add detailed item information on next line
              if (yPosition + 35 > pageHeight - margin) {
                pdf.addPage();
                currentPage++;
                yPosition = margin;
                addPageBorder();
              }

              pdf.setFontSize(8);
              pdf.setFont("helvetica", "normal");
              pdf.text(
                `Rate: ${formatAmount(item.rate)} | Discount: ${item.discount
                }% | Tax: ${item.tax}%`,
                margin + 5,
                yPosition + 2
              );
              yPosition += 4;

              if (item.serviceCharges && item.serviceCharges > 0) {
                pdf.text(
                  `Service Charges: ${formatAmount(item.serviceCharges)}`,
                  margin + 5,
                  yPosition + 2
                );
                yPosition += 4;
              }

              // Add product image if available
              if (item.productImage) {
                try {
                  await addImageToPDF(
                    item.productImage,
                    margin + 5,
                    yPosition,
                    30,
                    20
                  );
                  yPosition += 25;
                } catch (error) {
                  console.error("Error adding product image:", error);
                  yPosition += 5;
                }
              } else {
                yPosition += 5;
              }

              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(9);
            }

            // Section total - Fixed positioning to stay within borders
            yPosition += 5;
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.setFillColor(59, 130, 246);
            pdf.setTextColor(255, 255, 255);

            // Use full width for total row, keep it within borders
            pdf.rect(margin, yPosition - 2, contentWidth, 10, "F");

            // ✅ Section total with numbering
            pdf.text(
              `${titleCounter}. TOTAL(${title.title.toUpperCase()})`,
              margin + 5,
              yPosition + 5
            );
            pdf.text(
              formatAmount(sectionTotal),
              summaryColumns[1] - 20,
              yPosition + 5,
              { align: "right" }
            );
            yPosition += 15;
            pdf.setTextColor(0, 0, 0);
          }

          // ✅ Increment title counter for next title
          titleCounter++;
        }
      }

      // Overall summary on new page
      pdf.addPage();
      currentPage++;
      yPosition = margin;
      addPageBorder();

      // Summary header WITH NUMBERING
      pdf.setFillColor(59, 130, 246);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 12, "F");

      // ✅ Add final numbering to summary
      const visibleTitlesCount =
        quotationSection.data.titles?.filter(
          (title: QuotationTitle) => !quotationData.deletedFields?.[title.id]
        ).length || 0;
      const summaryNumber = visibleTitlesCount + 1;
      pdf.text(
        `${summaryNumber}. QUOTATION SUMMARY`,
        margin + 5,
        yPosition + 8
      );
      yPosition += 20;
      pdf.setTextColor(0, 0, 0);

      // Calculate totals
      const subtotal = visibleItems.reduce(
        (sum: number, item: QuotationItem) => {
          return sum + item.quantity * item.rate * (1 - item.discount / 100);
        },
        0
      );

      const totalTax = visibleItems.reduce(
        (sum: number, item: QuotationItem) => {
          const itemSubtotal =
            item.quantity * item.rate * (1 - item.discount / 100);
          return sum + itemSubtotal * (item.tax / 100);
        },
        0
      );

      const totalServiceCharges = visibleItems.reduce(
        (sum: number, item: QuotationItem) => {
          return sum + (item.serviceCharges || 0);
        },
        0
      );

      const grandTotal = subtotal + totalTax + totalServiceCharges;

      // Summary table
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");

      const summaryItems = [
        { label: "SUB-TOTAL", value: formatAmount(subtotal) },
        { label: "VAT(5%)", value: formatAmount(totalTax) },
        { label: "Service Charges", value: formatAmount(totalServiceCharges) },
      ];

      summaryItems.forEach((item, index) => {
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 10, "F");
        }

        pdf.text(item.label, summaryColumns[0] + 5, yPosition + 5);
        pdf.text(item.value, summaryColumns[1] + 5, yPosition + 5);
        yPosition += 10;
      });

      // Grand total - Properly positioned within borders
      yPosition += 5;
      pdf.setFillColor(59, 130, 246);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 12, "F");

      // ✅ Add numbering to grand total
      pdf.text(`${summaryNumber + 1}. TOTAL (AED)`, margin + 5, yPosition + 7);
      pdf.text(formatAmount(grandTotal), summaryColumns[1] + 5, yPosition + 7);
      yPosition += 20;
      pdf.setTextColor(0, 0, 0);
    }
  }

  // Add bank details footer on last page
  const totalPages = pdf.getNumberOfPages();
  pdf.setPage(totalPages);

  // Bank details section
  const bankDetailsY = pageHeight - 80;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);

  // ✅ Add numbering to bank details
  const visibleTitlesCount =
    quotationSection?.data.titles?.filter(
      (title: QuotationTitle) => !quotationData.deletedFields?.[title.id]
    ).length || 0;
  const bankDetailsNumber = visibleTitlesCount + 3;
  pdf.text(`${bankDetailsNumber}. BANK DETAILS:`, margin, bankDetailsY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("BANK NAME: ADCB", margin, bankDetailsY + 8);
  pdf.text(
    "ACCOUNT TITLE: SBR SYSTEM TECHNICAL SERVICES CO",
    margin,
    bankDetailsY + 14
  );
  pdf.text("ACCOUNT NO: 13047666920001", margin, bankDetailsY + 20);
  pdf.text("IBAN (AED): AE090030013047666920001", margin, bankDetailsY + 26);

  // Signature on right
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Bilal", pageWidth - margin - 30, bankDetailsY + 20);
  pdf.setFont("helvetica", "bold");
  pdf.text("Technical Manager", pageWidth - margin - 50, bankDetailsY + 26);

  // Add page numbers to all pages
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 20,
      pageHeight - 10
    );
    pdf.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      margin,
      pageHeight - 10
    );
  }

  return pdf;
};

export default function NewQuotationPage() {
  const { formatAmount } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams.get("id");

  const {
    customers,
    loading: customersLoading,
    error: customersError,
  } = useCustomers();
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();

  const [quotationData, setQuotationData] = useState({
    quotationNumber: `QT-${Date.now()}`,
    customerId: "",
    status: "draft" as "draft" | "sent" | "approved" | "rejected",
    issueDate: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    notes: "",
    terms: "",
  });

  const [sections, setSections] = useState<QuotationSection[]>([
    {
      id: "cover_page",
      type: "cover_page",
      title: "Cover Page & Letter",
      enabled: false,
      order: 1,
      data: {
        companyLogo: companySettings.logoUrl,
        companyName: companySettings.companyName,
        companyAddress: `${companySettings.address.street}, ${companySettings.address.city}, ${companySettings.address.state} ${companySettings.address.zipCode}, ${companySettings.address.country}`,
        companyPhone: companySettings.contact.phone,
        companyEmail: companySettings.contact.email,
        companyWebsite: companySettings.contact.website,
        date: new Date().toISOString().split("T")[0],
        recipientName: "",
        recipientCompany: "",
        recipientAddress: "",
        recipientPhone: "",
        recipientEmail: "",
        subject: "Proposal for Professional Services",
        salutation: "Dear [Recipient Name],",
        letterContent: `We are pleased to submit this comprehensive proposal for your consideration. Our team has carefully analyzed your requirements and developed a tailored solution that meets your specific needs.`,
        senderName: "John Smith",
        senderTitle: "Business Development Manager",
        senderPhone: "+971 50 123 4567",
        senderEmail: "john.smith@sbrtech.com",
        coverImages: [],
      },
    },
    {
      id: "executive_summary",
      type: "executive_summary",
      title: "Executive Summary",
      enabled: false,
      order: 2,
      data: {
        summary: `This proposal presents a comprehensive solution tailored to meet your specific business requirements. Our experienced team brings deep industry knowledge and proven methodologies to deliver exceptional results.`,
        keyBenefits: [
          "Cost-effective solution with ROI within 6 months",
          "Streamlined processes reducing operational overhead by 30%",
          "Scalable architecture supporting future growth",
          "24/7 technical support and maintenance",
          "Comprehensive training and knowledge transfer",
        ],
        proposalValue: "",
        estimatedDuration: "3-6 months",
        totalInvestment: "",
      },
    },
    {
      id: "company_introduction",
      type: "company_introduction",
      title: "Company Introduction",
      enabled: false,
      order: 3,
      data: {
        companyLogo: "https://via.placeholder.com/150x50?text=SBR+Logo",
        description:
          "SBR Technologies is a leading provider of enterprise software solutions, specializing in digital transformation, custom software development, and technology consulting services. With over 10 years of experience, we have successfully delivered projects for Fortune 500 companies and startups alike.",
        foundedYear: "2015",
        employeeCount: "50+",
        officeLocations: ["Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE"],
        certifications: ["ISO 9001:2015", "ISO 27001", "CMMI Level 3"],
        achievements: [
          "500+ Successful Projects Completed",
          "50+ Enterprise Clients Served",
          "98% Client Satisfaction Rate",
          "10+ Years Industry Experience",
          "Award-winning Development Team",
        ],
        coreValues: [
          "Innovation & Excellence",
          "Customer-Centric Approach",
          "Quality & Reliability",
          "Ethical Business Practices",
          "Continuous Learning",
        ],
        companyImages: [],
      },
    },
    {
      id: "problem_statement",
      type: "problem_statement",
      title: "Problem Statement",
      enabled: false,
      order: 4,
      data: {
        clientChallenges: [
          "Inefficient manual processes causing delays and errors",
          "Lack of real-time visibility into business operations",
          "Difficulty scaling operations with business growth",
          "Data silos preventing comprehensive insights",
          "Compliance and regulatory reporting challenges",
        ],
        currentSituation: `Your organization is currently facing several operational challenges that are impacting efficiency, scalability, and competitiveness. Manual processes, disparate systems, and lack of integration are creating bottlenecks that hinder productivity and decision-making capabilities.`,
        impactAssessment: `These challenges are resulting in:
• Increased operational costs (estimated 25-30% higher than optimized operations)
• Reduced productivity and efficiency
• Higher error rates and rework requirements
• Delayed decision-making processes
• Limited scalability for business growth
• Reduced customer satisfaction scores`,
        objectives: [
          "Streamline and automate manual processes",
          "Implement integrated systems for real-time visibility",
          "Create scalable architecture for future growth",
          "Establish comprehensive reporting and analytics",
          "Ensure compliance with industry standards",
        ],
        successCriteria: [
          "30% reduction in operational costs",
          "50% improvement in process efficiency",
          "Real-time visibility into all business operations",
          "Scalable system supporting 200% growth capacity",
          "100% compliance with regulatory requirements",
        ],
      },
    },
    {
      id: "solution_details",
      type: "solution_details",
      title: "Solution Details",
      enabled: false,
      order: 5,
      data: {
        approach: `Our solution approach is based on industry best practices and proven methodologies. We follow a structured implementation process that ensures quality, minimizes risks, and maximizes value delivery.`,
        solutionOverview: `We propose a comprehensive solution that addresses all identified challenges through:

1. **Integrated Platform**: Unified system replacing disparate tools and processes
2. **Automation Engine**: Intelligent automation of repetitive tasks and workflows
3. **Analytics Dashboard**: Real-time insights and reporting capabilities
4. **Scalable Architecture**: Cloud-native design supporting future growth
5. **Security Framework**: Enterprise-grade security and compliance features`,
        keyFeatures: [
          "Unified dashboard for all business operations",
          "Automated workflow processing and approvals",
          "Real-time analytics and reporting",
          "Mobile-responsive design for remote access",
          "Integration capabilities with existing systems",
          "Advanced security and data protection",
          "Scalable cloud infrastructure",
          "24/7 system availability and monitoring",
        ],
        technicalApproach: `Our technical implementation follows industry standards and best practices:

• **Frontend**: Modern React-based user interface with responsive design
• **Backend**: Microservices architecture with RESTful APIs
• **Database**: High-performance relational database with data warehousing capabilities
• **Infrastructure**: Cloud-native deployment with auto-scaling and high availability
• **Security**: Multi-layered security with encryption, access controls, and compliance features
• **Integration**: API-first design enabling seamless integration with existing systems`,
        benefits: [
          "Improved operational efficiency and productivity",
          "Reduced costs through automation and optimization",
          "Enhanced decision-making with real-time insights",
          "Increased scalability and flexibility",
          "Better compliance and risk management",
          "Improved customer experience and satisfaction",
        ],
        solutionImages: [],
      },
    },
    {
      id: "product_specifications",
      type: "product_specifications",
      title: "Product & Service Specifications",
      enabled: false,
      order: 6,
      data: {
        products: [] as ProductDetail[],
        technicalSpecifications: {
          platform: "Web-based SaaS Platform",
          technology: "React, Node.js, PostgreSQL, AWS Cloud",
          mobileSupport: "Responsive design for all devices",
          browserSupport: "Chrome, Firefox, Safari, Edge (latest versions)",
          apiIntegration: "RESTful APIs with OAuth 2.0 authentication",
          dataSecurity: "AES-256 encryption, SSL/TLS, GDPR compliance",
          backup: "Automated daily backups with disaster recovery",
          uptime: "99.9% SLA with 24/7 monitoring",
        },
        serviceSpecifications: [
          {
            service: "Implementation & Deployment",
            description: "Complete system setup, configuration and deployment",
            deliverables: [
              "System installation",
              "Data migration",
              "User training",
              "Go-live support",
            ],
            timeline: "4-6 weeks",
          },
          {
            service: "Customization & Integration",
            description:
              "Tailored modifications and third-party system integration",
            deliverables: [
              "Custom development",
              "API integration",
              "Testing",
              "Documentation",
            ],
            timeline: "2-4 weeks",
          },
          {
            service: "Training & Support",
            description: "Comprehensive training and ongoing technical support",
            deliverables: [
              "User training sessions",
              "Admin training",
              "24/7 support",
              "Knowledge base",
            ],
            timeline: "Ongoing",
          },
        ],
        complianceStandards: [
          "ISO 27001 Information Security Management",
          "GDPR Data Protection Compliance",
          "SOC 2 Type II Security Controls",
          "PCI DSS Payment Card Industry Standards",
          "HIPAA Health Insurance Portability (if applicable)",
        ],
      },
    },
    {
      id: "quotation_items",
      type: "quotation_items",
      title: "Quotation Items",
      enabled: false,
      order: 7,
      data: {
        items: [] as QuotationItem[],
        titles: [] as QuotationTitle[],
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0,
        serviceCharges: 0,
        grandTotal: 0,
        currency: "AED",
        notes: "",
      },
    },
    {
      id: "timeline_schedule",
      type: "timeline_schedule",
      title: "Timeline & Delivery Schedule",
      enabled: false,
      order: 8,
      data: {
        totalDuration: "16 weeks",
        startDate: "",
        endDate: "",
        phases: [
          {
            name: "Planning & Analysis",
            duration: "2 weeks",
            startDate: "",
            endDate: "",
            deliverables: [
              "Requirements gathering",
              "System analysis",
              "Project plan development",
              "Resource allocation",
            ],
            milestones: ["Kickoff meeting", "Requirements signoff"],
          },
          {
            name: "Design & Development",
            duration: "8 weeks",
            startDate: "",
            endDate: "",
            deliverables: [
              "System design documents",
              "UI/UX mockups",
              "Database design",
              "Core functionality development",
              "Integration development",
            ],
            milestones: [
              "Design approval",
              "Development completion",
              "Testing phase start",
            ],
          },
          {
            name: "Testing & Quality Assurance",
            duration: "3 weeks",
            startDate: "",
            endDate: "",
            deliverables: [
              "Unit testing",
              "Integration testing",
              "User acceptance testing",
              "Performance testing",
              "Security testing",
            ],
            milestones: ["QA completion", "UAT signoff"],
          },
          {
            name: "Deployment & Training",
            duration: "3 weeks",
            startDate: "",
            endDate: "",
            deliverables: [
              "Production deployment",
              "Data migration",
              "User training sessions",
              "Documentation delivery",
              "Go-live support",
            ],
            milestones: ["Go-live", "Training completion", "Project closure"],
          },
        ],
        criticalPath: [
          "Requirements analysis completion",
          "Design approval",
          "Development milestone reviews",
          "Testing completion",
          "User acceptance signoff",
        ],
        dependencies: [
          "Phase 2 cannot start until Phase 1 requirements are approved",
          "Phase 3 testing requires Phase 2 development completion",
          "Phase 4 deployment requires Phase 3 testing signoff",
        ],
        risks: [
          {
            risk: "Resource availability",
            impact: "Medium",
            mitigation: "Backup resource planning and cross-training",
          },
          {
            risk: "Third-party integration delays",
            impact: "High",
            mitigation: "Early vendor engagement and contingency planning",
          },
          {
            risk: "Scope changes",
            impact: "Medium",
            mitigation: "Change control process and regular scope reviews",
          },
        ],
      },
    },
    {
      id: "terms_warranties",
      type: "terms_warranties",
      title: "Terms & Warranties",
      enabled: false,
      order: 9,
      data: {
        generalTerms: `1. **Acceptance**: This proposal constitutes the entire agreement between the parties.
2. **Validity**: This proposal is valid for 30 days from the date of submission.
3. **Payment Terms**: All payments must be made according to the agreed schedule.
4. **Intellectual Property**: All deliverables remain the property of the client upon full payment.
5. **Confidentiality**: Both parties agree to maintain confidentiality of proprietary information.`,
        warranties: [
          {
            item: "Software Functionality",
            warranty: "12 months from go-live date",
            coverage: "Bugs and defects in core functionality",
            exclusions: "Custom modifications, third-party integrations",
          },
          {
            item: "System Performance",
            warranty: "99.5% uptime SLA",
            coverage: "System availability and performance",
            exclusions: "Scheduled maintenance, force majeure events",
          },
          {
            item: "Data Security",
            warranty: "Industry-standard security measures",
            coverage: "Data protection and privacy compliance",
            exclusions: "Client data breaches due to misuse",
          },
        ],
        limitations: `• Warranty does not cover damages due to misuse or unauthorized modifications
• Warranty is limited to the original specifications and scope
• Third-party components are covered by their respective vendor warranties
• Warranty claims must be reported within 30 days of discovery`,
        supportServices: {
          included: [
            "24/7 system monitoring",
            "Email support during business hours",
            "Phone support for critical issues",
            "Regular system updates and patches",
            "Knowledge base and documentation access",
          ],
          optional: [
            "Dedicated support engineer",
            "On-site support visits",
            "Extended warranty coverage",
            "Custom training sessions",
            "Emergency response service",
          ],
        },
        terminationClauses: `Either party may terminate this agreement with 30 days written notice. In case of termination:
• Client will pay for all services rendered up to termination date
• All intellectual property rights transfer to client
• Confidential information remains protected
• Outstanding payments become immediately due`,
        governingLaw: "United Arab Emirates",
        disputeResolution:
          "Arbitration in Dubai International Arbitration Centre",
      },
    },
    {
      id: "contact_information",
      type: "contact_information",
      title: "Contact Information & Signatures",
      enabled: false,
      order: 10,
      data: {
        companyContacts: [
          {
            name: "John Smith",
            title: "Business Development Manager",
            phone: "+971 50 123 4567",
            email: "john.smith@sbrtech.com",
            department: "Sales",
          },
          {
            name: "Sarah Johnson",
            title: "Project Manager",
            phone: "+971 50 765 4321",
            email: "sarah.johnson@sbrtech.com",
            department: "Delivery",
          },
          {
            name: "Mike Davis",
            title: "Technical Lead",
            phone: "+971 50 987 6543",
            email: "mike.davis@sbrtech.com",
            department: "Technical",
          },
        ],
        clientContacts: [
          {
            name: "",
            title: "",
            phone: "",
            email: "",
            department: "",
          },
        ],
        signatures: {
          clientSignature: "",
          clientName: "",
          clientTitle: "",
          clientDate: "",
          companySignature: "John Smith",
          companyName: "John Smith",
          companyTitle: "Business Development Manager",
          companyDate: new Date().toISOString().split("T")[0],
        },
        nextSteps: [
          "Review and approval of proposal",
          "Contract signing and legal review",
          "Project kickoff meeting scheduling",
          "Resource allocation and team assignment",
          "Detailed project planning and timeline confirmation",
        ],
        additionalNotes: "",
      },
    },
  ]);

  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    saveDraft: false,
    saveQuotation: false,
    generatePDF: false,
    sendQuotation: false,
  });

  const [savedQuotationId, setSavedQuotationId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Service-related states
  const [selectedProductServices, setSelectedProductServices] = useState<{
    [key: string]: any[];
  }>({});
  const [selectedServices, setSelectedServices] = useState<{
    [key: string]: { [serviceId: string]: boolean };
  }>({});
  const [serviceDetails, setServiceDetails] = useState<{
    [key: string]: any[];
  }>({});
  const [collapsedTitles, setCollapsedTitles] = useState<string[]>([]);
  const [deletedFields, setDeletedFields] = useState<{
    [key: string]: boolean;
  }>({});

  // NEW: State for template and sections visibility
  const [isTemplateSectionVisible, setIsTemplateSectionVisible] =
    useState(true);
  const [isProposalSectionsVisible, setIsProposalSectionsVisible] =
    useState(true);
  const [isBasicInfoVisible, setIsBasicInfoVisible] = useState(true);

  // Template Application Function
  const applyTemplate = (templateKey: keyof typeof QUOTATION_TEMPLATES) => {
    const template = QUOTATION_TEMPLATES[templateKey];

    const updatedSections = sections.map((section) => {
      if (section.type === "cover_page") {
        return {
          ...section,
          data: {
            ...section.data,
            subject: template.coverPage.subject,
            salutation: template.coverPage.salutation,
            letterContent: template.coverPage.letterContent,
          },
        };
      }

      if (section.type === "executive_summary") {
        return {
          ...section,
          data: {
            ...section.data,
            summary: template.executiveSummary.summary,
            keyBenefits: template.executiveSummary.keyBenefits,
          },
        };
      }

      return section;
    });

    setSections(updatedSections);
    alert(`Template "${template.name}" applied successfully!`);
  };

  // Load quotation data when editing
  useEffect(() => {
    if (quotationId) {
      loadQuotationData(quotationId);
    }
  }, [quotationId]);

  const loadQuotationData = async (id: string) => {
    setLoadingStates((prev) => ({ ...prev, saveQuotation: true }));
    try {
      const quotation = await loadQuotationFromFirebase(id);

      if (quotation) {
        setQuotationData({
          quotationNumber: quotation.quotationNumber || `QT-${Date.now()}`,
          customerId: quotation.customerId || "",
          status: quotation.status || "draft",
          issueDate:
            quotation.issueDate || new Date().toISOString().split("T")[0],
          validUntil:
            quotation.validUntil ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
          notes: quotation.notes || "",
          terms: quotation.terms || "",
        });

        if (quotation.sections) {
          setSections(quotation.sections);
        }

        setSavedQuotationId(id);
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error loading quotation:", error);
      alert("Error loading quotation data");
    } finally {
      setLoadingStates((prev) => ({ ...prev, saveQuotation: false }));
    }
  };

  // Auto-fill customer details when customer is selected
  useEffect(() => {
    if (quotationData.customerId) {
      const selectedCustomer = customers.find(
        (c) => c.id === quotationData.customerId
      );
      if (selectedCustomer) {
        const coverSection = sections.find((s) => s.type === "cover_page");
        if (coverSection) {
          updateSectionData("cover_page", {
            recipientName: selectedCustomer.primaryContact.name,
            recipientCompany: selectedCustomer.companyName,
            recipientEmail: selectedCustomer.primaryContact.email,
            recipientPhone: selectedCustomer.primaryContact.phone,
          });
        }

        const contactSection = sections.find(
          (s) => s.type === "contact_information"
        );
        if (contactSection) {
          updateSectionData("contact_information", {
            clientContacts: [
              {
                name: selectedCustomer.primaryContact.name,
                title: selectedCustomer.primaryContact.designation,
                phone: selectedCustomer.primaryContact.phone,
                email: selectedCustomer.primaryContact.email,
                department: "",
              },
            ],
          });
        }
      }
    }
  }, [quotationData.customerId, customers]);

  const calculateTotals = useCallback(() => {
    const quotationSection = sections.find((s) => s.type === "quotation_items");
    if (!quotationSection) return;

    // Filter out deleted items
    const visibleItems = quotationSection.data.items.filter(
      (item: QuotationItem) => !deletedFields[item.id]
    );

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalServiceCharges = 0;

    visibleItems.forEach((item: QuotationItem) => {
      const itemSubtotal = item.quantity * item.rate;
      const itemDiscount =
        item.discountType === "percentage"
          ? itemSubtotal * (item.discount / 100)
          : item.discount;
      const itemTax =
        item.taxType === "percentage"
          ? (itemSubtotal - itemDiscount) * (item.tax / 100)
          : item.tax;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      totalTax += itemTax;
      totalServiceCharges += item.serviceCharges || 0;
    });

    const grandTotal =
      subtotal - totalDiscount + totalTax + totalServiceCharges;

    if (
      quotationSection.data.subtotal !== subtotal ||
      quotationSection.data.totalDiscount !== totalDiscount ||
      quotationSection.data.totalTax !== totalTax ||
      quotationSection.data.grandTotal !== grandTotal
    ) {
      const updatedSections = sections.map((section) =>
        section.id === "quotation_items"
          ? {
            ...section,
            data: {
              ...section.data,
              subtotal,
              totalDiscount,
              totalTax,
              serviceCharges: totalServiceCharges,
              grandTotal,
            },
          }
          : section
      );
      setSections(updatedSections);
    }
  }, [sections, deletedFields]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals, deletedFields]);

  const moveSection = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);

    newSections.forEach((section, index) => {
      section.order = index + 1;
    });

    setSections(newSections);
  };

  const toggleSection = (sectionId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, enabled: !section.enabled }
          : section
      )
    );
  };

  const updateSectionData = (sectionId: string, data: any) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, data: { ...section.data, ...data } }
          : section
      )
    );
  };

  const addProductDetail = () => {
    const productSection = sections.find(
      (s) => s.type === "product_specifications"
    );
    if (productSection) {
      const newProduct: ProductDetail = {
        id: `product_${Date.now()}`,
        productId: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        description: "",
        images: [],
      };

      updateSectionData("product_specifications", {
        products: [...productSection.data.products, newProduct],
      });
    }
  };

  const removeProductDetail = (productId: string) => {
    const productSection = sections.find(
      (s) => s.type === "product_specifications"
    );
    if (productSection) {
      updateSectionData("product_specifications", {
        products: productSection.data.products.filter(
          (p: ProductDetail) => p.id !== productId
        ),
      });
    }
  };

  const updateProductDetail = (
    productId: string,
    data: Partial<ProductDetail>
  ) => {
    const productSection = sections.find(
      (s) => s.type === "product_specifications"
    );
    if (productSection) {
      updateSectionData("product_specifications", {
        products: productSection.data.products.map((p: ProductDetail) =>
          p.id === productId ? { ...p, ...data } : p
        ),
      });
    }
  };

  const addQuotationTitle = () => {
    const quotationSection = sections.find((s) => s.type === "quotation_items");
    if (quotationSection) {
      const newTitle: QuotationTitle = {
        id: `title_${Date.now()}`,
        title: "",
      };

      updateSectionData("quotation_items", {
        titles: [...quotationSection.data.titles, newTitle],
      });
    }
  };

  const removeQuotationTitle = (titleId: string) => {
    const quotationSection = sections.find((s) => s.type === "quotation_items");
    if (quotationSection) {
      updateSectionData("quotation_items", {
        titles: quotationSection.data.titles.filter(
          (t: QuotationTitle) => t.id !== titleId
        ),
      });
    }
  };

  const updateQuotationTitle = (
    titleId: string,
    data: Partial<QuotationTitle>
  ) => {
    const quotationSection = sections.find((s) => s.type === "quotation_items");
    if (quotationSection) {
      updateSectionData("quotation_items", {
        titles: quotationSection.data.titles.map((t: QuotationTitle) =>
          t.id === titleId ? { ...t, ...data } : t
        ),
      });
    }
  };

  const addQuotationItem = (titleId: string) => {
    const quotationSection = sections.find((s) => s.type === "quotation_items");

    if (quotationSection) {
      const titleItems = quotationSection.data.items.filter(
        (item: QuotationItem) => item.titleId === titleId
      );

      const newItem: QuotationItem = {
        id: `item_${Date.now()}`,
        titleId: titleId,
        itemId: `Q${(titleItems.length + 1).toString().padStart(3, "0")}`,
        productId: "",
        productName: "",
        sku: "",
        description: "",
        quantity: 1,
        rate: 0,
        discount: 0,
        discountType: "percentage",
        tax: 0,
        taxType: "percentage",
        serviceCharges: 0,
        amount: 0,
        images: [],
        printVisibility: {
          itemId: true,
          sku: true,
          productName: true,
          description: true,
          quantity: true,
          rate: true,
          discount: true,
          tax: true,
          amount: true,
        },
      };

      updateSectionData("quotation_items", {
        ...quotationSection.data,
        items: [...quotationSection.data.items, newItem],
      });
    }
  };

  const removeQuotationItem = (itemId: string) => {
    const quotationSection = sections.find((s) => s.type === "quotation_items");
    if (quotationSection) {
      updateSectionData("quotation_items", {
        items: quotationSection.data.items.filter(
          (item: QuotationItem) => item.id !== itemId
        ),
      });
    }
  };

  const updateQuotationItem = (
    itemId: string,
    data: Partial<QuotationItem>
  ) => {
    const quotationSection = sections.find((s) => s.type === "quotation_items");
    if (quotationSection) {
      const updatedItems = quotationSection.data.items.map(
        (item: QuotationItem) => {
          if (item.id === itemId) {
            const updatedItem = { ...item, ...data };

            const subtotal = updatedItem.quantity * updatedItem.rate;
            const discountAmount =
              updatedItem.discountType === "percentage"
                ? subtotal * (updatedItem.discount / 100)
                : updatedItem.discount;
            const taxableAmount = subtotal - discountAmount;
            const taxAmount =
              updatedItem.taxType === "percentage"
                ? taxableAmount * (updatedItem.tax / 100)
                : updatedItem.tax;
            updatedItem.amount =
              taxableAmount + taxAmount + updatedItem.serviceCharges;

            return updatedItem;
          }
          return item;
        }
      );

      updateSectionData("quotation_items", { items: updatedItems });
    }
  };

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSectionId) return;

    const fromIndex = sections.findIndex((s) => s.id === draggedSection);
    const toIndex = sections.findIndex((s) => s.id === targetSectionId);

    moveSection(fromIndex, toIndex);
    setDraggedSection(null);
  };

  const validateQuotation = () => {
    if (!quotationData.customerId) {
      return "Please select a customer";
    }

    const quotationSection = sections.find((s) => s.type === "quotation_items");
    if (quotationSection?.data.items.length === 0) {
      return "Please add at least one quotation item";
    }

    if (!quotationData.quotationNumber) {
      return "Quotation number is required";
    }

    return null;
  };

  // Save Quotation Function
  const saveQuotation = async () => {
    setLoadingStates((prev) => ({ ...prev, saveQuotation: true }));
    try {
      const validationError = validateQuotation();
      if (validationError) {
        alert(validationError);
        return;
      }

      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      const customer = customers.find((c) => c.id === quotationData.customerId);

      if (!customer) {
        alert("Please select a customer");
        return;
      }

      const finalQuotationData = {
        ...quotationData,
        status: "draft",
        customerName: customer.primaryContact.name,
        customerCompany: customer.companyName,
        customerEmail: customer.primaryContact.email,
        customerPhone: customer.primaryContact.phone,
        sections: sections.filter((s) => s.enabled),
        items: quotationSection?.data.items || [],
        titles: quotationSection?.data.titles || [],

        // Save services state
        selectedServices: selectedServices,
        serviceDetails: serviceDetails,

        subtotal: quotationSection?.data.subtotal || 0,
        totalDiscount: quotationSection?.data.totalDiscount || 0,
        totalTax: quotationSection?.data.totalTax || 0,
        serviceCharges: quotationSection?.data.serviceCharges || 0,
        totalAmount: quotationSection?.data.grandTotal || 0,
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const firebaseData = JSON.parse(JSON.stringify(finalQuotationData));

      let quotationId;
      if (savedQuotationId) {
        await updateQuotationInFirebase(savedQuotationId, firebaseData);
        quotationId = savedQuotationId;
        alert("Quotation updated successfully!");
      } else {
        quotationId = await saveQuotationToFirebase(firebaseData);
        setSavedQuotationId(quotationId);
        setIsEditing(true);
        alert("Quotation saved successfully!");
      }
    } catch (error: any) {
      console.error("Error saving quotation:", error);

      let errorMessage = "Error saving quotation";
      if (error.code === "permission-denied") {
        errorMessage = "Permission denied. Please check your Firebase rules.";
      } else if (error.code === "unavailable") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message?.includes("entity")) {
        errorMessage =
          "Data too large. Please reduce image sizes or remove some images.";
      }

      alert(errorMessage);
    } finally {
      setLoadingStates((prev) => ({ ...prev, saveQuotation: false }));
    }
  };

  // Save as Draft Function
  const saveAsDraft = async () => {
    setLoadingStates((prev) => ({ ...prev, saveDraft: true }));
    try {
      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      const customer = customers.find((c) => c.id === quotationData.customerId);

      const finalQuotationData = {
        ...quotationData,
        status: "draft",
        customerName: customer?.primaryContact.name || "",
        customerCompany: customer?.companyName || "",
        customerEmail: customer?.primaryContact.email || "",
        customerPhone: customer?.primaryContact.phone || "",
        sections: sections.filter((s) => s.enabled),
        items: quotationSection?.data.items || [],
        titles: quotationSection?.data.titles || [],

        // Save services state
        selectedServices: selectedServices,
        serviceDetails: serviceDetails,

        subtotal: quotationSection?.data.subtotal || 0,
        totalDiscount: quotationSection?.data.totalDiscount || 0,
        totalTax: quotationSection?.data.totalTax || 0,
        serviceCharges: quotationSection?.data.serviceCharges || 0,
        totalAmount: quotationSection?.data.grandTotal || 0,
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const firebaseData = JSON.parse(JSON.stringify(finalQuotationData));

      let quotationId;
      if (savedQuotationId) {
        await updateQuotationInFirebase(savedQuotationId, firebaseData);
        quotationId = savedQuotationId;
        alert("Draft updated successfully!");
      } else {
        quotationId = await saveQuotationToFirebase(firebaseData);
        setSavedQuotationId(quotationId);
        setIsEditing(true);
        alert("Draft saved successfully!");
      }
    } catch (error: any) {
      console.error("Error saving draft:", error);

      let errorMessage = "Error saving draft";
      if (error.code === "permission-denied") {
        errorMessage = "Permission denied. Please check your Firebase rules.";
      } else if (error.code === "unavailable") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message?.includes("entity")) {
        errorMessage =
          "Data too large. Please reduce image sizes or remove some images.";
      }

      alert(errorMessage);
    } finally {
      setLoadingStates((prev) => ({ ...prev, saveDraft: false }));
    }
  };

  // Send Quotation Function
  const sendQuotation = async () => {
    setLoadingStates((prev) => ({ ...prev, sendQuotation: true }));
    try {
      const validationError = validateQuotation();
      if (validationError) {
        alert(validationError);
        return;
      }

      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      const customer = customers.find((c) => c.id === quotationData.customerId);

      if (!customer) {
        alert("Please select a customer");
        return;
      }

      const finalQuotationData = {
        ...quotationData,
        status: "sent",
        customerName: customer.primaryContact.name,
        customerCompany: customer.companyName,
        customerEmail: customer.primaryContact.email,
        customerPhone: customer.primaryContact.phone,
        sections: sections.filter((s) => s.enabled),
        items: quotationSection?.data.items || [],
        titles: quotationSection?.data.titles || [],
        subtotal: quotationSection?.data.subtotal || 0,
        totalDiscount: quotationSection?.data.totalDiscount || 0,
        totalTax: quotationSection?.data.totalTax || 0,
        serviceCharges: quotationSection?.data.serviceCharges || 0,
        totalAmount: quotationSection?.data.grandTotal || 0,
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const firebaseData = JSON.parse(JSON.stringify(finalQuotationData));

      let quotationId;
      if (savedQuotationId) {
        await updateQuotationInFirebase(savedQuotationId, firebaseData);
        quotationId = savedQuotationId;
      } else {
        quotationId = await saveQuotationToFirebase(firebaseData);
      }

      alert("Quotation sent successfully!");
      router.push("/admin/sales/quotations");
    } catch (error: any) {
      console.error("Error sending quotation:", error);

      let errorMessage = "Error sending quotation";
      if (error.code === "permission-denied") {
        errorMessage = "Permission denied. Please check your Firebase rules.";
      } else if (error.code === "unavailable") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message?.includes("entity")) {
        errorMessage =
          "Data too large. Please reduce image sizes or remove some images.";
      }

      alert(errorMessage);
    } finally {
      setLoadingStates((prev) => ({ ...prev, sendQuotation: false }));
    }
  };

  // Updated PDF Generation with Images
  const generatePDF = async () => {
    setLoadingStates((prev) => ({ ...prev, generatePDF: true }));
    try {
      const pdf = await generatePDFWithImages(
        quotationData,
        sections,
        customers,
        products,
        formatAmount,
        selectedServices,
        serviceDetails
      );
      pdf.save(`quotation-${quotationData.quotationNumber}.pdf`);
      alert("PDF generated successfully with all images!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, generatePDF: false }));
    }
  };

  // Template Selection Component with Toggle Button and Width Animation
  const TemplateSelector = () => (
    <Card className="mb-1 max-w-100 p-0 overflow-hidden">
      {/* HEADER SECTION - No extra padding/margin */}
      <div className="px-3 py-2 flex items-center justify-between min-h-[40px]">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold">Select Template</span>
          <span className="text-sm text-gray-500 font-semibold">(5 templates)</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsTemplateSectionVisible(!isTemplateSectionVisible)}
          className="h-6 w-6"
        >
          {isTemplateSectionVisible ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* CONTENT SECTION - Zero height when hidden */}
      <div
        className={`
        transition-all duration-300 ease-in-out 
        overflow-hidden
        ${isTemplateSectionVisible ? "max-h-[300px]" : "max-h-0"}
      `}
      >
        {/* Inner wrapper to ensure no extra space */}
        <div className={isTemplateSectionVisible ? "p-3" : "p-0"}>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(QUOTATION_TEMPLATES).map(([key, template]) => (
              <Button
                key={key}
                variant="outline"
                className="h-10 py-1 px-2 flex flex-row items-center justify-start gap-1 hover:border-red-300 hover:bg-red-50 transition-colors text-xs"
                onClick={() =>
                  applyTemplate(key as keyof typeof QUOTATION_TEMPLATES)
                }
              >
                <FileText className="h-3 w-3 text-red-600" />
                <span className="font-medium truncate">{template.name}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-6.5 text-center leading-tight">
            <span>Click any template to auto-fill cover page & executive </span>
            <br />
            <span>summary</span>
          </p>
        </div>
      </div>
    </Card>
  );


  const renderCoverPage = (section: QuotationSection) => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Company Information</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="companyLogo">Company Logo URL</Label>
              <Input
                id="companyLogo"
                value={section.data.companyLogo}
                onChange={(e) =>
                  updateSectionData(section.id, { companyLogo: e.target.value })
                }
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label>Cover Images</Label>
              <ImageUploader
                images={section.data.coverImages || []}
                onImagesChange={(images) =>
                  updateSectionData(section.id, { coverImages: images })
                }
                multiple={true}
                maxImages={5}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Recipient Information</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                value={section.data.recipientName}
                onChange={(e) =>
                  updateSectionData(section.id, {
                    recipientName: e.target.value,
                  })
                }
                placeholder="Enter recipient name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientCompany">Company</Label>
              <Input
                id="recipientCompany"
                value={section.data.recipientCompany}
                onChange={(e) =>
                  updateSectionData(section.id, {
                    recipientCompany: e.target.value,
                  })
                }
                placeholder="Enter company name"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Cover Letter</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={section.data.subject}
              onChange={(e) =>
                updateSectionData(section.id, { subject: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="letterContent">Letter Content</Label>
            <Textarea
              id="letterContent"
              value={section.data.letterContent}
              onChange={(e) =>
                updateSectionData(section.id, { letterContent: e.target.value })
              }
              rows={8}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderExecutiveSummary = (section: QuotationSection) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="summary">Executive Summary</Label>
        <Textarea
          id="summary"
          value={section.data.summary}
          onChange={(e) =>
            updateSectionData(section.id, { summary: e.target.value })
          }
          rows={8}
          className="text-lg leading-relaxed"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Key Benefits</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newBenefits = [...section.data.keyBenefits, ""];
                updateSectionData(section.id, { keyBenefits: newBenefits });
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (section.data.keyBenefits.length > 1) {
                  const newBenefits = section.data.keyBenefits.slice(0, -1);
                  updateSectionData(section.id, { keyBenefits: newBenefits });
                }
              }}
              disabled={section.data.keyBenefits.length <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {section.data.keyBenefits.map((benefit: string, index: number) => (
            <div key={index} className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-medium flex-shrink-0">
                {index + 1}
              </div>
              <Input
                value={benefit}
                onChange={(e) => {
                  const newBenefits = [...section.data.keyBenefits];
                  newBenefits[index] = e.target.value;
                  updateSectionData(section.id, { keyBenefits: newBenefits });
                }}
                placeholder={`Key benefit ${index + 1}...`}
                className="flex-1"
              />
              {section.data.keyBenefits.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newBenefits = section.data.keyBenefits.filter(
                      (_: string, i: number) => i !== index
                    );
                    updateSectionData(section.id, { keyBenefits: newBenefits });
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="proposalValue">Proposal Value</Label>
          <Input
            id="proposalValue"
            value={section.data.proposalValue}
            onChange={(e) =>
              updateSectionData(section.id, { proposalValue: e.target.value })
            }
            placeholder="e.g., $500,000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedDuration">Estimated Duration</Label>
          <Input
            id="estimatedDuration"
            value={section.data.estimatedDuration}
            onChange={(e) =>
              updateSectionData(section.id, {
                estimatedDuration: e.target.value,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalInvestment">Total Investment</Label>
          <Input
            id="totalInvestment"
            value={section.data.totalInvestment}
            onChange={(e) =>
              updateSectionData(section.id, { totalInvestment: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );

  const renderCompanyIntroduction = (section: QuotationSection) => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <img
          src={section.data.companyLogo}
          alt="Company Logo"
          className="h-20 w-20 object-contain rounded-lg border"
        />
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                value={section.data.foundedYear}
                onChange={(e) =>
                  updateSectionData(section.id, { foundedYear: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeCount">Employee Count</Label>
              <Input
                id="employeeCount"
                value={section.data.employeeCount}
                onChange={(e) =>
                  updateSectionData(section.id, {
                    employeeCount: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Company Description</Label>
        <Textarea
          id="description"
          value={section.data.description}
          onChange={(e) =>
            updateSectionData(section.id, { description: e.target.value })
          }
          rows={4}
        />
      </div>

      <div className="space-y-4">
        <Label>Company Images</Label>
        <ImageUploader
          images={section.data.companyImages || []}
          onImagesChange={(images) =>
            updateSectionData(section.id, { companyImages: images })
          }
          multiple={true}
          maxImages={10}
        />
      </div>

      <div className="space-y-2">
        <Label>Office Locations</Label>
        <div className="flex flex-wrap gap-2">
          {section.data.officeLocations.map(
            (location: string, index: number) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {location}
              </Badge>
            )
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Certifications</Label>
        <div className="flex flex-wrap gap-2">
          {section.data.certifications.map((cert: string, index: number) => (
            <Badge
              key={index}
              variant="outline"
              className="px-3 py-1 border-blue-200 text-blue-700"
            >
              {cert}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Achievements</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newAchievements = [...section.data.achievements, ""];
                updateSectionData(section.id, {
                  achievements: newAchievements,
                });
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (section.data.achievements.length > 1) {
                  const newAchievements = section.data.achievements.slice(
                    0,
                    -1
                  );
                  updateSectionData(section.id, {
                    achievements: newAchievements,
                  });
                }
              }}
              disabled={section.data.achievements.length <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {section.data.achievements.map(
            (achievement: string, index: number) => (
              <div key={index} className="flex items-center gap-3 group">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <Input
                  value={achievement}
                  onChange={(e) => {
                    const newAchievements = [...section.data.achievements];
                    newAchievements[index] = e.target.value;
                    updateSectionData(section.id, {
                      achievements: newAchievements,
                    });
                  }}
                  placeholder={`Achievement ${index + 1}...`}
                  className="flex-1"
                />
                {section.data.achievements.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newAchievements = section.data.achievements.filter(
                        (_: string, i: number) => i !== index
                      );
                      updateSectionData(section.id, {
                        achievements: newAchievements,
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  const renderProblemStatement = (section: QuotationSection) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Client Challenges</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newChallenges = [...section.data.clientChallenges, ""];
                updateSectionData(section.id, {
                  clientChallenges: newChallenges,
                });
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (section.data.clientChallenges.length > 1) {
                  const newChallenges = section.data.clientChallenges.slice(
                    0,
                    -1
                  );
                  updateSectionData(section.id, {
                    clientChallenges: newChallenges,
                  });
                }
              }}
              disabled={section.data.clientChallenges.length <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {section.data.clientChallenges.map(
            (challenge: string, index: number) => (
              <div key={index} className="flex items-center gap-3 group">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <Input
                  value={challenge}
                  onChange={(e) => {
                    const newChallenges = [...section.data.clientChallenges];
                    newChallenges[index] = e.target.value;
                    updateSectionData(section.id, {
                      clientChallenges: newChallenges,
                    });
                  }}
                  placeholder={`Challenge ${index + 1}...`}
                  className="flex-1"
                />
                {section.data.clientChallenges.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newChallenges =
                        section.data.clientChallenges.filter(
                          (_: string, i: number) => i !== index
                        );
                      updateSectionData(section.id, {
                        clientChallenges: newChallenges,
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            )
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentSituation">Current Situation Analysis</Label>
        <Textarea
          id="currentSituation"
          value={section.data.currentSituation}
          onChange={(e) =>
            updateSectionData(section.id, { currentSituation: e.target.value })
          }
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="impactAssessment">Impact Assessment</Label>
        <Textarea
          id="impactAssessment"
          value={section.data.impactAssessment}
          onChange={(e) =>
            updateSectionData(section.id, { impactAssessment: e.target.value })
          }
          rows={4}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Project Objectives</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newObjectives = [...section.data.objectives, ""];
                updateSectionData(section.id, { objectives: newObjectives });
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (section.data.objectives.length > 1) {
                  const newObjectives = section.data.objectives.slice(0, -1);
                  updateSectionData(section.id, { objectives: newObjectives });
                }
              }}
              disabled={section.data.objectives.length <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {section.data.objectives.map((objective: string, index: number) => (
            <div key={index} className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-medium flex-shrink-0">
                {index + 1}
              </div>
              <Input
                value={objective}
                onChange={(e) => {
                  const newObjectives = [...section.data.objectives];
                  newObjectives[index] = e.target.value;
                  updateSectionData(section.id, { objectives: newObjectives });
                }}
                placeholder={`Objective ${index + 1}...`}
                className="flex-1"
              />
              {section.data.objectives.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newObjectives = section.data.objectives.filter(
                      (_: any, i: number) => i !== index
                    );
                    updateSectionData(section.id, {
                      objectives: newObjectives,
                    });
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSolutionDetails = (section: QuotationSection) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="approach">Our Approach</Label>
        <Textarea
          id="approach"
          value={section.data.approach}
          onChange={(e) =>
            updateSectionData(section.id, { approach: e.target.value })
          }
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="solutionOverview">Solution Overview</Label>
        <Textarea
          id="solutionOverview"
          value={section.data.solutionOverview}
          onChange={(e) =>
            updateSectionData(section.id, { solutionOverview: e.target.value })
          }
          rows={8}
        />
      </div>

      <div className="space-y-4">
        <Label>Solution Images</Label>
        <ImageUploader
          images={section.data.solutionImages || []}
          onImagesChange={(images) =>
            updateSectionData(section.id, { solutionImages: images })
          }
          multiple={true}
          maxImages={8}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Key Features</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newFeatures = [...section.data.keyFeatures, ""];
                updateSectionData(section.id, { keyFeatures: newFeatures });
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (section.data.keyFeatures.length > 1) {
                  const newFeatures = section.data.keyFeatures.slice(0, -1);
                  updateSectionData(section.id, { keyFeatures: newFeatures });
                }
              }}
              disabled={section.data.keyFeatures.length <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {section.data.keyFeatures.map((feature: string, index: number) => (
            <div key={index} className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex-shrink-0">
                {index + 1}
              </div>
              <Input
                value={feature}
                onChange={(e) => {
                  const newFeatures = [...section.data.keyFeatures];
                  newFeatures[index] = e.target.value;
                  updateSectionData(section.id, { keyFeatures: newFeatures });
                }}
                placeholder={`Feature ${index + 1}...`}
                className="flex-1"
              />
              {section.data.keyFeatures.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newFeatures = section.data.keyFeatures.filter(
                      (_: any, i: number) => i !== index
                    );
                    updateSectionData(section.id, { keyFeatures: newFeatures });
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="technicalApproach">Technical Approach</Label>
        <Textarea
          id="technicalApproach"
          value={section.data.technicalApproach}
          onChange={(e) =>
            updateSectionData(section.id, { technicalApproach: e.target.value })
          }
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Benefits</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newBenefits = [...section.data.benefits, ""];
                updateSectionData(section.id, { benefits: newBenefits });
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (section.data.benefits.length > 1) {
                  const newBenefits = section.data.benefits.slice(0, -1);
                  updateSectionData(section.id, { benefits: newBenefits });
                }
              }}
              disabled={section.data.benefits.length <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {section.data.benefits.map((benefit: string, index: number) => (
            <div key={index} className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-medium flex-shrink-0">
                {index + 1}
              </div>
              <Input
                value={benefit}
                onChange={(e) => {
                  const newBenefits = [...section.data.benefits];
                  newBenefits[index] = e.target.value;
                  updateSectionData(section.id, { benefits: newBenefits });
                }}
                placeholder={`Benefit ${index + 1}...`}
                className="flex-1"
              />
              {section.data.benefits.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newBenefits = section.data.benefits.filter(
                      (_: any, i: number) => i !== index
                    );
                    updateSectionData(section.id, { benefits: newBenefits });
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProductSpecifications = (section: QuotationSection) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-lg">Product Details</h4>
          <Button
            onClick={addProductDetail}
            size="sm"
            disabled={productsLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {productsLoading ? "Loading..." : "Add Product"}
          </Button>
        </div>

        {productsLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading products...</span>
          </div>
        )}

        {section.data.products.map((product: ProductDetail, index: number) => {
          const selectedProduct = products.find(
            (p) => p.id === product.productId
          );
          return (
            <Card key={product.id} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h5 className="font-medium">Product {index + 1}</h5>
                <Button
                  onClick={() => removeProductDetail(product.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select
                    value={product.productId}
                    onValueChange={(value) => {
                      const selectedProd = products.find((p) => p.id === value);
                      updateProductDetail(product.id, {
                        productId: value,
                        unitPrice: selectedProd?.sellingPrice || 0,
                        description: selectedProd?.description || "",
                        images: selectedProd?.images || [],
                      });
                    }}
                    disabled={productsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          productsLoading
                            ? "Loading products..."
                            : "Select product"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} - {formatAmount(p.sellingPrice)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={product.quantity}
                    onChange={(e) =>
                      updateProductDetail(product.id, {
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <Label>Product Images</Label>
                <ImageUploader
                  images={product.images || []}
                  onImagesChange={(images) =>
                    updateProductDetail(product.id, { images })
                  }
                  multiple={true}
                  maxImages={6}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    value={product.unitPrice}
                    onChange={(e) => {
                      updateProductDetail(product.id, {
                        unitPrice: parseFloat(e.target.value) || 0,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    value={product.discount}
                    onChange={(e) => {
                      updateProductDetail(product.id, {
                        discount: parseFloat(e.target.value) || 0,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Line Total</Label>
                  <Input
                    value={formatAmount(
                      product.quantity *
                      product.unitPrice *
                      (1 - product.discount / 100)
                    )}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={
                    product.description || selectedProduct?.description || ""
                  }
                  onChange={(e) =>
                    updateProductDetail(product.id, {
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  placeholder={
                    selectedProduct?.description || "Product description"
                  }
                />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Technical Specifications</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Input
              id="platform"
              value={section.data.technicalSpecifications.platform}
              onChange={(e) =>
                updateSectionData(section.id, {
                  technicalSpecifications: {
                    ...section.data.technicalSpecifications,
                    platform: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="technology">Technology Stack</Label>
            <Input
              id="technology"
              value={section.data.technicalSpecifications.technology}
              onChange={(e) =>
                updateSectionData(section.id, {
                  technicalSpecifications: {
                    ...section.data.technicalSpecifications,
                    technology: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobileSupport">Mobile Support</Label>
            <Input
              id="mobileSupport"
              value={section.data.technicalSpecifications.mobileSupport}
              onChange={(e) =>
                updateSectionData(section.id, {
                  technicalSpecifications: {
                    ...section.data.technicalSpecifications,
                    mobileSupport: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="browserSupport">Browser Support</Label>
            <Input
              id="browserSupport"
              value={section.data.technicalSpecifications.browserSupport}
              onChange={(e) =>
                updateSectionData(section.id, {
                  technicalSpecifications: {
                    ...section.data.technicalSpecifications,
                    browserSupport: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Service Specifications</h4>
        {section.data.serviceSpecifications.map(
          (service: any, index: number) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Input
                    value={service.service}
                    onChange={(e) => {
                      const newServices = [
                        ...section.data.serviceSpecifications,
                      ];
                      newServices[index].service = e.target.value;
                      updateSectionData(section.id, {
                        serviceSpecifications: newServices,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeline</Label>
                  <Input
                    value={service.timeline}
                    onChange={(e) => {
                      const newServices = [
                        ...section.data.serviceSpecifications,
                      ];
                      newServices[index].timeline = e.target.value;
                      updateSectionData(section.id, {
                        serviceSpecifications: newServices,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Description</Label>
                <Textarea
                  value={service.description}
                  onChange={(e) => {
                    const newServices = [...section.data.serviceSpecifications];
                    newServices[index].description = e.target.value;
                    updateSectionData(section.id, {
                      serviceSpecifications: newServices,
                    });
                  }}
                  rows={2}
                />
              </div>
            </Card>
          )
        )}
      </div>

      <div className="space-y-4">
        <Label>Compliance Standards</Label>
        <div className="flex flex-wrap gap-2">
          {section.data.complianceStandards.map(
            (standard: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="px-3 py-1 border-green-200 text-green-700"
              >
                {standard}
              </Badge>
            )
          )}
        </div>
      </div>
    </div>
  );


  // quotation item

  const [columnDropdownOpen, setColumnDropdownOpen] = useState<string | null>(
    null
  );
  const [showServicesSection, setShowServicesSection] = useState<{
    [key: string]: boolean;
  }>({});
  const [isTextareaMode, setIsTextareaMode] = useState(true);

  // Function to toggle services section visibility
  const toggleServicesSection = (itemId: string) => {
    setShowServicesSection((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const renderQuotationItems = (section: QuotationSection) => {
    // Toggle title collapse
    const toggleTitleCollapse = (titleId: string) => {
      setCollapsedTitles((prev) =>
        prev.includes(titleId)
          ? prev.filter((id) => id !== titleId)
          : [...prev, titleId]
      );
    };

    // Check if same product exists for merging
    const findExistingItem = (productId: string, titleId: string) => {
      return section.data.items.find(
        (item: QuotationItem) =>
          item.productId === productId &&
          item.titleId === titleId &&
          !deletedFields[item.id]
      );
    };

    // Function to fetch product services
    const fetchProductServices = async (productId: string) => {
      if (!productId) return;

      try {
        const productDoc = await getDoc(doc(db, "products", productId));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          const services = productData.services || [];

          setSelectedProductServices((prev) => ({
            ...prev,
            [productId]: services,
          }));
        }
      } catch (error) {
        console.error("Error fetching product services:", error);
      }
    };

    // Function to generate automatic Item ID (1.1, 1.2, 1.3, etc.)
    const generateItemId = (titleIndex: number, itemIndex: number) => {
      return `${titleIndex + 1}.${itemIndex + 1}`;
    };

    // Add quotation item with automatic Item ID
    const addQuotationItemLocal = (titleId: string, titleIndex: number) => {
      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      if (!quotationSection) return;

      // Count items in this title for Item ID
      const itemsInThisTitle = quotationSection.data.items.filter(
        (item: QuotationItem) =>
          item.titleId === titleId && !deletedFields[item.id]
      );

      const newItem: QuotationItem = {
        id: `item_${Date.now()}`,
        titleId: titleId,
        itemId: generateItemId(titleIndex, itemsInThisTitle.length),
        productId: "",
        productName: "",
        sku: "",
        description: "",
        quantity: 1,
        rate: 0,
        discount: 0,
        discountType: "percentage",
        tax: 0,
        taxType: "percentage",
        serviceCharges: 0,
        amount: 0,
        images: [],
        printVisibility: {
          itemId: true,
          sku: true,
          productName: true,
          description: true,
          quantity: true,
          rate: true,
          discount: true,
          tax: true,
          amount: true,
        },
      };

      updateSectionData("quotation_items", {
        ...quotationSection.data,
        items: [...quotationSection.data.items, newItem],
      });
    };

    // Update item with merge logic AND fetch services
    const updateQuotationItemWithMerge = async (
      itemId: string,
      data: Partial<QuotationItem>
    ) => {
      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      if (!quotationSection) return;

      const currentItem = quotationSection.data.items.find(
        (item: QuotationItem) => item.id === itemId
      );
      if (!currentItem) return;

      // Check if this is a product change and if same product already exists
      if (data.productId && data.productId !== currentItem.productId) {
        const existingItem = findExistingItem(
          data.productId,
          currentItem.titleId
        );

        if (existingItem && existingItem.id !== itemId) {
          // Merge with existing item
          const mergedItem = {
            ...existingItem,
            quantity: existingItem.quantity + (currentItem.quantity || 1),
            amount: existingItem.amount + (currentItem.amount || 0),
          };

          // Remove current item and update existing item
          const updatedItems = quotationSection.data.items
            .filter(
              (item: QuotationItem) =>
                item.id !== itemId && item.id !== existingItem.id
            )
            .concat([mergedItem]);

          updateSectionData("quotation_items", {
            items: updatedItems,
          });

          // Clean up services for deleted item
          setSelectedServices((prev) => {
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
          });

          setServiceDetails((prev) => {
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
          });

          return;
        }

        // Fetch services for the new product
        await fetchProductServices(data.productId);

        // Clear previous services for this item
        setSelectedServices((prev) => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });

        setServiceDetails((prev) => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
      }

      // Normal update
      const updatedItems = quotationSection.data.items.map(
        (item: QuotationItem) => {
          if (item.id === itemId) {
            const updatedItem = { ...item, ...data };

            // Calculate amounts
            const subtotal = updatedItem.quantity * updatedItem.rate;
            const discountAmount =
              updatedItem.discountType === "percentage"
                ? subtotal * (updatedItem.discount / 100)
                : updatedItem.discount;
            const taxableAmount = subtotal - discountAmount;
            const taxAmount =
              updatedItem.taxType === "percentage"
                ? taxableAmount * (updatedItem.tax / 100)
                : updatedItem.tax;

            updatedItem.amount =
              taxableAmount + taxAmount + updatedItem.serviceCharges;

            return updatedItem;
          }
          return item;
        }
      );

      updateSectionData("quotation_items", { items: updatedItems });
    };

    // Handle service selection
    const handleServiceSelection = (
      itemId: string,
      serviceId: string,
      service: any,
      isSelected: boolean
    ) => {
      // Update selected services state
      setSelectedServices((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [serviceId]: isSelected,
        },
      }));

      // Store service details
      if (isSelected) {
        setServiceDetails((prev) => ({
          ...prev,
          [itemId]: [...(prev[itemId] || []), service],
        }));
      } else {
        setServiceDetails((prev) => ({
          ...prev,
          [itemId]: (prev[itemId] || []).filter(
            (s: any) => s.serviceId !== serviceId
          ),
        }));
      }

      // Find the item
      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      if (!quotationSection) return;

      const currentItem = quotationSection.data.items.find(
        (item: QuotationItem) => item.id === itemId
      );
      if (!currentItem) return;

      // Calculate new service charges
      let newServiceCharges = currentItem.serviceCharges || 0;
      const servicePrice = service.total || service.price || 0;

      if (isSelected) {
        newServiceCharges += servicePrice;
      } else {
        newServiceCharges -= servicePrice;
      }

      // Update the item with new service charges
      updateQuotationItem(itemId, {
        serviceCharges: Math.max(0, newServiceCharges),
      });

      // Auto-update description with service information
      const updatedServiceDetails = isSelected
        ? [...(serviceDetails[itemId] || []), service]
        : (serviceDetails[itemId] || []).filter(
          (s: any) => s.serviceId !== serviceId
        );

      if (updatedServiceDetails.length > 0) {
        const serviceText = updatedServiceDetails
          .map(
            (s) => `${s.serviceName} (${formatAmount(s.total || s.price || 0)})`
          )
          .join(", ");

        const autoDescription = `We implement these services with these charges: ${serviceText}`;

        // Only update if description is empty or contains the auto-generated text
        if (
          !currentItem.description ||
          currentItem.description.includes("We implement these services")
        ) {
          updateQuotationItem(itemId, {
            description: autoDescription,
          });
        }
      } else {
        // Clear auto-generated description if no services selected
        if (
          currentItem.description &&
          currentItem.description.includes("We implement these services")
        ) {
          updateQuotationItem(itemId, {
            description: "",
          });
        }
      }
    };

    // Update quotation item directly
    const updateQuotationItem = (
      itemId: string,
      data: Partial<QuotationItem>
    ) => {
      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      if (!quotationSection) return;

      const updatedItems = quotationSection.data.items.map(
        (item: QuotationItem) => {
          if (item.id === itemId) {
            const updatedItem = { ...item, ...data };

            // Recalculate amount
            const subtotal = updatedItem.quantity * updatedItem.rate;
            const discountAmount =
              updatedItem.discountType === "percentage"
                ? subtotal * (updatedItem.discount / 100)
                : updatedItem.discount;
            const taxableAmount = subtotal - discountAmount;
            const taxAmount =
              updatedItem.taxType === "percentage"
                ? taxableAmount * (updatedItem.tax / 100)
                : updatedItem.tax;

            updatedItem.amount =
              taxableAmount + taxAmount + updatedItem.serviceCharges;

            return updatedItem;
          }
          return item;
        }
      );

      updateSectionData("quotation_items", { items: updatedItems });
    };

    // Remove quotation item completely
    const removeQuotationItem = (itemId: string) => {
      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      if (!quotationSection) return;

      const updatedItems = quotationSection.data.items.filter(
        (item: QuotationItem) => item.id !== itemId
      );

      updateSectionData("quotation_items", { items: updatedItems });
    };

    // Remove quotation title completely
    const removeQuotationTitle = (titleId: string) => {
      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      if (!quotationSection) return;

      // Remove the title
      const updatedTitles = quotationSection.data.titles.filter(
        (title: QuotationTitle) => title.id !== titleId
      );

      // Remove all items under this title
      const updatedItems = quotationSection.data.items.filter(
        (item: QuotationItem) => item.titleId !== titleId
      );

      // Clean up services for all items under this title
      quotationSection.data.items
        .filter((item: QuotationItem) => item.titleId === titleId)
        .forEach((item: QuotationItem) => {
          setSelectedServices((prev) => {
            const newState = { ...prev };
            delete newState[item.id];
            return newState;
          });

          setServiceDetails((prev) => {
            const newState = { ...prev };
            delete newState[item.id];
            return newState;
          });
        });

      updateSectionData("quotation_items", {
        titles: updatedTitles,
        items: updatedItems,
      });
    };

    // Delete individual field value
    const deleteFieldValue = (
      itemId: string,
      fieldName: keyof QuotationItem,
      defaultValue: any = ""
    ) => {
      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      if (!quotationSection) return;

      const updatedItems = quotationSection.data.items.map(
        (item: QuotationItem) => {
          if (item.id === itemId) {
            const updatedItem = { ...item, [fieldName]: defaultValue };

            // Recalculate amount if related fields changed
            if (
              [
                "quantity",
                "rate",
                "discount",
                "tax",
                "serviceCharges",
              ].includes(fieldName as string)
            ) {
              const subtotal = updatedItem.quantity * updatedItem.rate;
              const discountAmount =
                updatedItem.discountType === "percentage"
                  ? subtotal * (updatedItem.discount / 100)
                  : updatedItem.discount;
              const taxableAmount = subtotal - discountAmount;
              const taxAmount =
                updatedItem.taxType === "percentage"
                  ? taxableAmount * (updatedItem.tax / 100)
                  : updatedItem.tax;

              updatedItem.amount =
                taxableAmount + taxAmount + updatedItem.serviceCharges;
            }

            return updatedItem;
          }
          return item;
        }
      );

      updateSectionData("quotation_items", { items: updatedItems });
    };

    // Delete product from item
    const deleteProductFromItem = (itemId: string) => {
      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      if (!quotationSection) return;

      const updatedItems = quotationSection.data.items.map(
        (item: QuotationItem) => {
          if (item.id === itemId) {
            return {
              ...item,
              productId: "",
              productName: "",
              sku: "",
              description: "",
              rate: 0,
              images: [],
            };
          }
          return item;
        }
      );

      updateSectionData("quotation_items", { items: updatedItems });

      // Clear services for this item
      setSelectedServices((prev) => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });

      setServiceDetails((prev) => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    };

    // Delete SKU from item
    const deleteSkuFromItem = (itemId: string) => {
      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      if (!quotationSection) return;

      const updatedItems = quotationSection.data.items.map(
        (item: QuotationItem) => {
          if (item.id === itemId) {
            return {
              ...item,
              sku: "",
            };
          }
          return item;
        }
      );

      updateSectionData("quotation_items", { items: updatedItems });
    };

    // Delete images from item
    const deleteImagesFromItem = (itemId: string) => {
      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      if (!quotationSection) return;

      const updatedItems = quotationSection.data.items.map(
        (item: QuotationItem) => {
          if (item.id === itemId) {
            return {
              ...item,
              images: [],
            };
          }
          return item;
        }
      );

      updateSectionData("quotation_items", { items: updatedItems });
    };

    // Delete services from item
    const deleteServicesFromItem = (itemId: string) => {
      // Clear services selection
      setSelectedServices((prev) => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });

      setServiceDetails((prev) => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });

      // Update item with zero service charges
      deleteFieldValue(itemId, "serviceCharges", 0);
    };

    // Mark field as deleted AND remove it
    const deleteField = (fieldId: string, fieldType: "item" | "title") => {
      // Mark as deleted in state
      setDeletedFields((prev) => ({ ...prev, [fieldId]: true }));

      if (fieldType === "item") {
        // Clean up services for this item
        setSelectedServices((prev) => {
          const newState = { ...prev };
          delete newState[fieldId];
          return newState;
        });

        setServiceDetails((prev) => {
          const newState = { ...prev };
          delete newState[fieldId];
          return newState;
        });

        // Remove the item completely
        removeQuotationItem(fieldId);
      } else {
        // Remove the title and all its items
        removeQuotationTitle(fieldId);
      }
    };

    // Filter out deleted items for display
    const getVisibleItems = () => {
      return section.data.items.filter(
        (item: QuotationItem) => !deletedFields[item.id]
      );
    };

    const getVisibleTitles = () => {
      return section.data.titles.filter(
        (title: QuotationTitle) => !deletedFields[title.id]
      );
    };

    // State for column visibility dropdown

    // Function to toggle column dropdown
    const toggleColumnDropdown = (titleId: string) => {
      setColumnDropdownOpen(columnDropdownOpen === titleId ? null : titleId);
    };

    // Function to get visible columns based on printVisibility
    // const getVisibleColumns = (item: QuotationItem) => {
    //   const columns = [];

    //   if (item.printVisibility?.itemId !== false) columns.push("itemId");
    //   if (item.printVisibility?.sku !== false) columns.push("sku");
    //   if (item.printVisibility?.productName !== false)
    //     columns.push("productName");
    //   if (item.printVisibility?.quantity !== false) columns.push("quantity");
    //   if (item.printVisibility?.rate !== false) columns.push("rate");
    //   if (item.printVisibility?.tax !== false) columns.push("tax");
    //   if (item.printVisibility?.discount !== false) columns.push("discount");
    //   if (item.printVisibility?.amount !== false) columns.push("amount");

    //   // Services always visible
    //   columns.push("services");

    //   return columns;
    // };

    // Function to get visible columns based on printVisibility
    const getVisibleColumns = (item: QuotationItem) => {
      const columns = [];

      // Add columns based on visibility - SEPARATE checks
      if (item.printVisibility?.itemId !== false) columns.push("itemId");
      if (item.printVisibility?.sku !== false) columns.push("sku");
      if (item.printVisibility?.productName !== false) columns.push("productName");
      if (item.printVisibility?.quantity !== false) columns.push("quantity");
      if (item.printVisibility?.rate !== false) columns.push("rate");
      if (item.printVisibility?.tax !== false) columns.push("tax");
      if (item.printVisibility?.discount !== false) columns.push("discount");
      if (item.printVisibility?.amount !== false) columns.push("amount");

      // Services always visible
      columns.push("services");

      return columns;
    };




    // Function to get grid columns class based on visible columns count
    const getGridColsClass = (count: number) => {
      const colClasses: Record<number, string> = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
        7: "grid-cols-7",
        8: "grid-cols-8",
        9: "grid-cols-9",
      };
      return colClasses[count] || "grid-cols-9";
    };

    // Function to get column width class based on column type
    const getColumnWidthClass = (column: string) => {
      const widthClasses: Record<string, string> = {
        itemId: "w-20 min-w-[80px]",
        productName: "w-80 min-w-[320px]",
        services: "w-24 min-w-[96px]",
        sku: "w-56 min-w-[224px]",
        quantity: "w-16 min-w-[64px]",
        rate: "w-20 min-w-[80px]",
        tax: "w-16 min-w-[64px]",
        discount: "w-20 min-w-[80px]",
        amount: "w-28 min-w-[112px]",
      };
      return widthClasses[column] || "";
    };

    // Function to update all items in a title with same visibility
    const updateAllItemsVisibility = (
      titleId: string,
      field: string,
      value: boolean
    ) => {
      const quotationSection = sections.find(
        (s) => s.type === "quotation_items"
      );
      if (!quotationSection) return;

      const updatedItems = quotationSection.data.items.map(
        (item: QuotationItem) => {
          if (item.titleId === titleId && !deletedFields[item.id]) {
            return {
              ...item,
              printVisibility: {
                ...item.printVisibility,
                [field]: value,
              },
            };
          }
          return item;
        }
      );

      updateSectionData("quotation_items", { items: updatedItems });
    };

    return (
      <div className="space-y-8">
        {getVisibleTitles().map((title: QuotationTitle, titleIndex: number) => {
          const relatedItems = getVisibleItems().filter(
            (item: QuotationItem) => item.titleId === title.id
          );
          const isCollapsed = collapsedTitles.includes(title.id);

          // Get visible columns from first item
          const sampleItem = relatedItems[0];
          const visibleColumns = sampleItem
            ? getVisibleColumns(sampleItem)
            : [
              "itemId",
              "productName",
              "services",
              "sku",
              "quantity",
              "rate",
              "tax",
              "discount",
              "amount",
            ];

          const columnCount = visibleColumns.length;
          const gridColsClass = getGridColsClass(columnCount);
          const isColumnDropdownOpen = columnDropdownOpen === title.id;

          return (
            <div
              key={title.id}
              className="border rounded-xl p-5 bg-gray-50 space-y-5"
            >
              {/* Title Header */}
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTitleCollapse(title.id)}
                    className="p-1 h-6 w-6 flex-shrink-0"
                  >
                    {isCollapsed ? (
                      <Plus className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                  </Button>

                  <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-200 text-blue-800 font-semibold flex-shrink-0">
                    {titleIndex + 1}
                  </div>

                  <div className="flex gap-2 flex-1">
                    <Input
                      value={title.title}
                      onChange={(e) =>
                        updateQuotationTitle(title.id, {
                          title: e.target.value,
                        })
                      }
                      placeholder={`Enter Title ${titleIndex + 1}...`}
                      className="font-medium flex-1 w-full"
                    />
                    <Button
                      onClick={() => deleteField(title.id, "title")}
                      variant="destructive"
                      size="sm"
                      className="h-9 px-3 bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>


              </div>








              {/* DYNAMIC TABLE LAYOUT */}
              {!isCollapsed && relatedItems.length > 0 && (
                <div className="overflow-x-auto mb-3">
                  {/* TABLE HEADER - Exact same layout as items */}
                  <div className="relative mb-2">
                    <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg border border-gray-300">
                      {/* Combined Number & Product Name Header */}
                      {visibleColumns.includes("itemId") && visibleColumns.includes("productName") && (
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-10">
                            <span className="text-sm font-semibold text-gray-700">Number</span>
                          </div>
                          <span className="text-gray-400 text-sm">•</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-gray-700">Product Name</span>
                          </div>
                        </div>
                      )}

                      {/* Part No Header */}
                      {visibleColumns.includes("sku") && (
                        <div className="flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-700 text-center w-[70px] block">
                            Part No
                          </span>
                        </div>
                      )}

                      {/* Qty Header */}
                      {visibleColumns.includes("quantity") && (
                        <div className="flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-700 text-center w-[50px] block">
                            Qty
                          </span>
                        </div>
                      )}

                      {/* Rate Header */}
                      {visibleColumns.includes("rate") && (
                        <div className="flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-700 text-center w-[60px] block">
                            Rate
                          </span>
                        </div>
                      )}

                      {/* Tax % Header */}
                      {visibleColumns.includes("tax") && (
                        <div className="flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-700 text-center w-[50px] block">
                            Tax %
                          </span>
                        </div>
                      )}

                      {/* Disc % Header */}
                      {visibleColumns.includes("discount") && (
                        <div className="flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-700 text-center w-[50px] block">
                            Disc %
                          </span>
                        </div>
                      )}

                      {/* Total Header - Space for delete button */}
                      {visibleColumns.includes("amount") && (
                        <div className="flex-shrink-0 flex items-center gap-1">
                          <span className="text-sm font-semibold text-gray-700 text-center min-w-[85px] block">
                            Total
                          </span>
                          {/* Empty space for delete button alignment */}
                          <div className="w-7"></div>
                        </div>
                      )}
                    </div>

                    {/* COLUMN VISIBILITY ICON */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleColumnDropdown(title.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>

                    {/* COLUMN VISIBILITY DROPDOWN */}
                    {isColumnDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <div className="p-3">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Show/Hide Columns
                          </h4>
                          <div className="space-y-2">
                            {/* SEPARATE CONTROLS FOR NUMBER AND PRODUCT */}
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-gray-700 cursor-pointer flex-1">
                                Number
                              </label>
                              <div className="relative">
                                <Checkbox
                                  checked={sampleItem?.printVisibility?.itemId !== false}
                                  onCheckedChange={(checked) => {
                                    updateAllItemsVisibility(
                                      title.id,
                                      "itemId",
                                      checked as boolean
                                    );
                                  }}
                                  className="h-4 w-4"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <label className="text-sm text-gray-700 cursor-pointer flex-1">
                                Product Name
                              </label>
                              <div className="relative">
                                <Checkbox
                                  checked={sampleItem?.printVisibility?.productName !== false}
                                  onCheckedChange={(checked) => {
                                    updateAllItemsVisibility(
                                      title.id,
                                      "productName",
                                      checked as boolean
                                    );
                                  }}
                                  className="h-4 w-4"
                                />
                              </div>
                            </div>

                            {/* REST OF THE CONTROLS */}
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-gray-700 cursor-pointer flex-1">
                                SKU/Part
                              </label>
                              <div className="relative">
                                <Checkbox
                                  checked={sampleItem?.printVisibility?.sku !== false}
                                  onCheckedChange={(checked) => {
                                    updateAllItemsVisibility(
                                      title.id,
                                      "sku",
                                      checked as boolean
                                    );
                                  }}
                                  className="h-4 w-4"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <label className="text-sm text-gray-700 cursor-pointer flex-1">
                                Quantity
                              </label>
                              <div className="relative">
                                <Checkbox
                                  checked={sampleItem?.printVisibility?.quantity !== false}
                                  onCheckedChange={(checked) => {
                                    updateAllItemsVisibility(
                                      title.id,
                                      "quantity",
                                      checked as boolean
                                    );
                                  }}
                                  className="h-4 w-4"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <label className="text-sm text-gray-700 cursor-pointer flex-1">
                                Rate
                              </label>
                              <div className="relative">
                                <Checkbox
                                  checked={sampleItem?.printVisibility?.rate !== false}
                                  onCheckedChange={(checked) => {
                                    updateAllItemsVisibility(
                                      title.id,
                                      "rate",
                                      checked as boolean
                                    );
                                  }}
                                  className="h-4 w-4"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <label className="text-sm text-gray-700 cursor-pointer flex-1">
                                Tax %
                              </label>
                              <div className="relative">
                                <Checkbox
                                  checked={sampleItem?.printVisibility?.tax !== false}
                                  onCheckedChange={(checked) => {
                                    updateAllItemsVisibility(
                                      title.id,
                                      "tax",
                                      checked as boolean
                                    );
                                  }}
                                  className="h-4 w-4"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <label className="text-sm text-gray-700 cursor-pointer flex-1">
                                Discount %
                              </label>
                              <div className="relative">
                                <Checkbox
                                  checked={sampleItem?.printVisibility?.discount !== false}
                                  onCheckedChange={(checked) => {
                                    updateAllItemsVisibility(
                                      title.id,
                                      "discount",
                                      checked as boolean
                                    );
                                  }}
                                  className="h-4 w-4"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <label className="text-sm text-gray-700 cursor-pointer flex-1">
                                Total
                              </label>
                              <div className="relative">
                                <Checkbox
                                  checked={sampleItem?.printVisibility?.amount !== false}
                                  onCheckedChange={(checked) => {
                                    updateAllItemsVisibility(
                                      title.id,
                                      "amount",
                                      checked as boolean
                                    );
                                  }}
                                  className="h-4 w-4"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>



                  {/* TABLE ROWS */}
                  <div className="space-y-3">
                    {relatedItems.map((item: QuotationItem, index: number) => {
                      const productServices =
                        selectedProductServices[item.productId] || [];
                      const itemSelectedServices =
                        selectedServices[item.id] || {};
                      const itemServiceDetails = serviceDetails[item.id] || [];
                      const itemVisibleColumns = getVisibleColumns(item);
                      const itemGridColsClass = getGridColsClass(
                        itemVisibleColumns.length
                      );
                      const isServicesVisible = showServicesSection[item.id] || false;




                      return (
                        <div
                          key={item.id}
                          className="border rounded-lg p-3 bg-white shadow-sm mb-3"
                        >
                          {/* Main Row - All in one line */}
                          <div className="flex items-center gap-2 mb-2">
                            {/* Number */}
                            <div className="flex-shrink-0 w-10">
                              <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 border border-gray-300 font-medium text-gray-700 text-sm">
                                {item.itemId || generateItemId(titleIndex, index)}
                              </div>
                            </div>

                            {/* Product Dropdown - Full width */}
                            <div className="flex-1 min-w-0">
                              <Select
                                value={item.productId}
                                onValueChange={async (value) => {
                                  const product = products.find((p) => p.id === value);
                                  if (product) {
                                    await updateQuotationItemWithMerge(item.id, {
                                      productId: value,
                                      productName: product.name,
                                      sku: product.sku || item.sku || "",
                                      description: product.description,
                                      rate: product.sellingPrice,
                                      images: product.images || [],
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full h-8 px-2 border-gray-300">
                                  <SelectValue placeholder="Select Product">
                                    {item.productId ? (
                                      (() => {
                                        const selectedProduct = products.find(p => p.id === item.productId);
                                        return selectedProduct ? (
                                          <span className="text-sm truncate">{selectedProduct.name}</span>
                                        ) : (
                                          <span className="text-gray-500 text-sm">Select Product</span>
                                        );
                                      })()
                                    ) : (
                                      <span className="text-gray-500 text-sm">Select Product</span>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>

                                <SelectContent className="min-w-[300px] max-h-[350px] overflow-y-auto">
                                  {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id} className="py-1.5">
                                      <div className="flex items-center gap-2">
                                        {p.images && p.images.length > 0 && (
                                          <img
                                            src={p.images[0]}
                                            alt={p.name}
                                            className="w-8 h-8 object-cover rounded border"
                                          />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm truncate">{p.name}</span>
                                            <span className="text-xs text-green-600 font-semibold ml-2">
                                              {formatAmount(p.sellingPrice)}
                                            </span>
                                          </div>
                                          {p.sku && (
                                            <div className="text-xs text-gray-500 truncate">{p.sku}</div>
                                          )}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Part No Input - Exactly like picture */}
                            <div className="flex-shrink-0">
                              <Input
                                value={item.sku || ""}
                                onChange={(e) =>
                                  updateQuotationItemWithMerge(item.id, {
                                    sku: e.target.value,
                                  })
                                }
                                placeholder="Part No"
                                className="text-sm border-gray-300 text-center w-[70px] h-8 px-1"
                              />
                            </div>

                            {/* Qty Input */}
                            <div className="flex-shrink-0">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuotationItemWithMerge(item.id, {
                                    quantity: +e.target.value,
                                  })
                                }
                                className="text-center w-[50px] h-8 px-1"
                                min="1"
                              />
                            </div>

                            {/* Rate Input */}
                            <div className="flex-shrink-0">
                              <Input
                                type="number"
                                value={item.rate}
                                onChange={(e) =>
                                  updateQuotationItemWithMerge(item.id, {
                                    rate: +e.target.value,
                                  })
                                }
                                className="text-center w-[60px] h-8 px-1"
                                min="0"
                              />
                            </div>

                            {/* Tax % Input */}
                            <div className="flex-shrink-0">
                              <Input
                                type="number"
                                value={item.tax}
                                onChange={(e) =>
                                  updateQuotationItemWithMerge(item.id, {
                                    tax: +e.target.value,
                                  })
                                }
                                className="text-center w-[50px] h-8 px-1"
                                min="0"
                                max="100"
                              />
                            </div>

                            {/* Disc % Input */}
                            <div className="flex-shrink-0">
                              <Input
                                type="number"
                                value={item.discount}
                                onChange={(e) =>
                                  updateQuotationItemWithMerge(item.id, {
                                    discount: +e.target.value,
                                    discountType: "percentage",
                                  })
                                }
                                className="text-center w-[50px] h-8 px-1"
                                min="0"
                                max="100"
                              />
                            </div>

                            {/* Total Amount - Green background like picture */}
                            <div className="flex-shrink-0 flex items-center gap-1">
                              <div className="text-center font-bold text-green-700 bg-green-100 py-1 px-2 rounded border border-green-300 h-8 flex items-center justify-center min-w-[85px] text-sm">
                                {formatAmount(item.amount)}
                              </div>

                              {/* Delete Button */}
                              <Button
                                onClick={() => deleteField(item.id, "item")}
                                variant="destructive"
                                size="sm"
                                className="h-7 w-7 p-0 bg-red-500 hover:bg-red-600 flex-shrink-0"
                                title="Delete item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Description Row - Below the main row */}
                          <div className="flex items-start mt-1">
                            {/* Empty space for number alignment */}
                            <div className="flex-shrink-0 w-10"></div>

                            {/* Description Textarea */}
                            <div className="flex-1">
                              <textarea
                                value={item.description || ""}
                                onChange={(e) =>
                                  updateQuotationItemWithMerge(item.id, {
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Enter description..."
                                className="w-full p-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none bg-white min-h-[40px]"
                                rows={2}
                              />
                            </div>
                          </div>






                          {/* SERVICES SECTION - Appears when Services button is clicked */}
                          {isServicesVisible && (
                            <div className="mt-4 pt-4 border-t border-blue-200 bg-blue-50 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-blue-900 text-sm">
                                    Select Services for this Product
                                  </span>
                                  {itemServiceDetails.length > 0 && (
                                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                      {itemServiceDetails.length} selected
                                    </span>
                                  )}
                                </div>

                                {itemServiceDetails.length > 0 && (
                                  <Button
                                    onClick={() => deleteServicesFromItem(item.id)}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Clear Services
                                  </Button>
                                )}
                              </div>

                              {item.productId && productServices.length > 0 ? (
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                  {productServices.map((service: any) => (
                                    <div
                                      key={service.serviceId}
                                      className="flex items-center justify-between hover:bg-blue-100 p-2 rounded"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Checkbox
                                          checked={
                                            itemSelectedServices[
                                            service.serviceId
                                            ] || false
                                          }
                                          onCheckedChange={(checked) => {
                                            handleServiceSelection(
                                              item.id,
                                              service.serviceId,
                                              service,
                                              checked as boolean
                                            );
                                          }}
                                        />
                                        <span className="text-sm font-medium">
                                          {service.serviceName}
                                        </span>
                                      </div>
                                      <span className="text-sm font-semibold text-blue-700">
                                        {formatAmount(
                                          service.total || service.price || 0
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : item.productId ? (
                                <div className="bg-gray-100 p-4 rounded-lg border text-center">
                                  <p className="text-gray-600 text-sm">
                                    No additional services available for this product
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                                  <p className="text-yellow-700 text-sm">
                                    Please select a product first to view available services
                                  </p>
                                </div>
                              )}

                              {itemServiceDetails.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-blue-300">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-blue-900 text-sm">
                                      Selected Services Summary:
                                    </span>
                                    <span className="font-bold text-blue-900 text-sm">
                                      {itemServiceDetails.length} service{itemServiceDetails.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <div className="text-sm text-blue-800 mt-2">
                                    <div className="flex justify-between">
                                      <span>Total Service Charges:</span>
                                      <span className="font-semibold">
                                        {formatAmount(item.serviceCharges || 0)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COLLAPSED STATE */}
              {isCollapsed && (
                <div className="text-center py-8 text-gray-500 bg-gray-100 rounded-lg">
                  <EyeOff className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg">Section Collapsed</p>
                  <p className="text-sm mt-1">
                    Click expand button to view items
                  </p>
                </div>
              )}

              {/* EMPTY STATE */}
              {!isCollapsed && relatedItems.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">
                    No Items Yet
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Start by adding your first item
                  </p>
                  <Button
                    onClick={() => addQuotationItemLocal(title.id, titleIndex)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {/* ADD BUTTONS */}
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            onClick={() => {
              const lastTitle =
                getVisibleTitles()[getVisibleTitles().length - 1];
              if (lastTitle) {
                const lastTitleIndex = getVisibleTitles().findIndex(
                  (t: QuotationTitle) => t.id === lastTitle.id
                );
                addQuotationItemLocal(lastTitle.id, lastTitleIndex);
              }
            }}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item to Last section
          </Button>

          <Button
            onClick={addQuotationTitle}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New Section
          </Button>
        </div>

        {/* SUMMARY SECTION */}
        <div className="mt-10 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-bold text-xl text-gray-800 mb-6 text-center">
            Quotation Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <p className="text-sm text-gray-600 font-medium mb-2">Subtotal</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatAmount(section.data.subtotal)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <p className="text-sm text-gray-600 font-medium mb-2">Discount</p>
              <p className="text-2xl font-bold text-green-600">
                -{formatAmount(section.data.totalDiscount)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <p className="text-sm text-gray-600 font-medium mb-2">Tax</p>
              <p className="text-2xl font-bold text-blue-600">
                +{formatAmount(section.data.totalTax)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
              <p className="text-sm text-gray-600 font-medium mb-2">Services</p>
              <p className="text-2xl font-bold text-purple-600">
                +{formatAmount(section.data.serviceCharges || 0)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-green-300 shadow-lg text-center">
              <p className="text-sm text-gray-600 font-medium mb-2">
                Grand Total
              </p>
              <p className="text-3xl font-extrabold text-green-700">
                {formatAmount(section.data.grandTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  //quotation item





  const renderTimelineSchedule = (section: QuotationSection) => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalDuration">Total Duration</Label>
          <Input
            id="totalDuration"
            value={section.data.totalDuration}
            onChange={(e) =>
              updateSectionData(section.id, { totalDuration: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={section.data.startDate}
            onChange={(e) =>
              updateSectionData(section.id, { startDate: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={section.data.endDate}
            onChange={(e) =>
              updateSectionData(section.id, { endDate: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Project Phases</h4>
        {section.data.phases.map((phase: any, index: number) => (
          <Card key={index} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Phase Name</Label>
                <Input
                  value={phase.name}
                  onChange={(e) => {
                    const newPhases = [...section.data.phases];
                    newPhases[index].name = e.target.value;
                    updateSectionData(section.id, { phases: newPhases });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={phase.duration}
                  onChange={(e) => {
                    const newPhases = [...section.data.phases];
                    newPhases[index].duration = e.target.value;
                    updateSectionData(section.id, { phases: newPhases });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={phase.startDate}
                  onChange={(e) => {
                    const newPhases = [...section.data.phases];
                    newPhases[index].startDate = e.target.value;
                    updateSectionData(section.id, { phases: newPhases });
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Deliverables</Label>
                <Textarea
                  value={phase.deliverables.join("\n")}
                  onChange={(e) => {
                    const newPhases = [...section.data.phases];
                    newPhases[index].deliverables = e.target.value.split("\n");
                    updateSectionData(section.id, { phases: newPhases });
                  }}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Milestones</Label>
                <Textarea
                  value={phase.milestones.join("\n")}
                  onChange={(e) => {
                    const newPhases = [...section.data.phases];
                    newPhases[index].milestones = e.target.value.split("\n");
                    updateSectionData(section.id, { phases: newPhases });
                  }}
                  rows={2}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Critical Path</Label>
        <Textarea
          value={section.data.criticalPath.join("\n")}
          onChange={(e) =>
            updateSectionData(section.id, {
              criticalPath: e.target.value.split("\n"),
            })
          }
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Dependencies</Label>
        <Textarea
          value={section.data.dependencies.join("\n")}
          onChange={(e) =>
            updateSectionData(section.id, {
              dependencies: e.target.value.split("\n"),
            })
          }
          rows={3}
        />
      </div>
    </div>
  );

  const renderTermsWarranties = (section: QuotationSection) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="generalTerms">General Terms</Label>
        <Textarea
          id="generalTerms"
          value={section.data.generalTerms}
          onChange={(e) =>
            updateSectionData(section.id, { generalTerms: e.target.value })
          }
          rows={8}
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Warranties</h4>
        {section.data.warranties.map((warranty: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Item</Label>
                <Input
                  value={warranty.item}
                  onChange={(e) => {
                    const newWarranties = [...section.data.warranties];
                    newWarranties[index].item = e.target.value;
                    updateSectionData(section.id, {
                      warranties: newWarranties,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Warranty</Label>
                <Input
                  value={warranty.warranty}
                  onChange={(e) => {
                    const newWarranties = [...section.data.warranties];
                    newWarranties[index].warranty = e.target.value;
                    updateSectionData(section.id, {
                      warranties: newWarranties,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Coverage</Label>
                <Textarea
                  value={warranty.coverage}
                  onChange={(e) => {
                    const newWarranties = [...section.data.warranties];
                    newWarranties[index].coverage = e.target.value;
                    updateSectionData(section.id, {
                      warranties: newWarranties,
                    });
                  }}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Exclusions</Label>
                <Textarea
                  value={warranty.exclusions}
                  onChange={(e) => {
                    const newWarranties = [...section.data.warranties];
                    newWarranties[index].exclusions = e.target.value;
                    updateSectionData(section.id, {
                      warranties: newWarranties,
                    });
                  }}
                  rows={2}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="limitations">Limitations</Label>
        <Textarea
          id="limitations"
          value={section.data.limitations}
          onChange={(e) =>
            updateSectionData(section.id, { limitations: e.target.value })
          }
          rows={4}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Support Services</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="font-medium text-green-700">Included Services</h5>
            <div className="space-y-2">
              {section.data.supportServices.included.map(
                (service: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <Input
                      value={service}
                      onChange={(e) => {
                        const newIncluded = [
                          ...section.data.supportServices.included,
                        ];
                        newIncluded[index] = e.target.value;
                        updateSectionData(section.id, {
                          supportServices: {
                            ...section.data.supportServices,
                            included: newIncluded,
                          },
                        });
                      }}
                      className="flex-1"
                    />
                  </div>
                )
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h5 className="font-medium text-blue-700">Optional Services</h5>
            <div className="space-y-2">
              {section.data.supportServices.optional.map(
                (service: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-blue-600">+</span>
                    <Input
                      value={service}
                      onChange={(e) => {
                        const newOptional = [
                          ...section.data.supportServices.optional,
                        ];
                        newOptional[index] = e.target.value;
                        updateSectionData(section.id, {
                          supportServices: {
                            ...section.data.supportServices,
                            optional: newOptional,
                          },
                        });
                      }}
                      className="flex-1"
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="terminationClauses">Termination Clauses</Label>
        <Textarea
          id="terminationClauses"
          value={section.data.terminationClauses}
          onChange={(e) =>
            updateSectionData(section.id, {
              terminationClauses: e.target.value,
            })
          }
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="governingLaw">Governing Law</Label>
          <Input
            id="governingLaw"
            value={section.data.governingLaw}
            onChange={(e) =>
              updateSectionData(section.id, { governingLaw: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="disputeResolution">Dispute Resolution</Label>
          <Input
            id="disputeResolution"
            value={section.data.disputeResolution}
            onChange={(e) =>
              updateSectionData(section.id, {
                disputeResolution: e.target.value,
              })
            }
          />
        </div>
      </div>
    </div>
  );

  const renderContactInformation = (section: QuotationSection) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Company Contacts</h4>
        {section.data.companyContacts.map((contact: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={contact.name}
                  onChange={(e) => {
                    const newContacts = [...section.data.companyContacts];
                    newContacts[index].name = e.target.value;
                    updateSectionData(section.id, {
                      companyContacts: newContacts,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={contact.title}
                  onChange={(e) => {
                    const newContacts = [...section.data.companyContacts];
                    newContacts[index].title = e.target.value;
                    updateSectionData(section.id, {
                      companyContacts: newContacts,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={contact.phone}
                  onChange={(e) => {
                    const newContacts = [...section.data.companyContacts];
                    newContacts[index].phone = e.target.value;
                    updateSectionData(section.id, {
                      companyContacts: newContacts,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => {
                    const newContacts = [...section.data.companyContacts];
                    newContacts[index].email = e.target.value;
                    updateSectionData(section.id, {
                      companyContacts: newContacts,
                    });
                  }}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Department</Label>
                <Input
                  value={contact.department}
                  onChange={(e) => {
                    const newContacts = [...section.data.companyContacts];
                    newContacts[index].department = e.target.value;
                    updateSectionData(section.id, {
                      companyContacts: newContacts,
                    });
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Client Contacts</h4>
        {section.data.clientContacts.map((contact: any, index: number) => (
          <Card key={index} className="p-4 border-dashed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={contact.name}
                  onChange={(e) => {
                    const newContacts = [...section.data.clientContacts];
                    newContacts[index].name = e.target.value;
                    updateSectionData(section.id, {
                      clientContacts: newContacts,
                    });
                  }}
                  placeholder="Client name"
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={contact.title}
                  onChange={(e) => {
                    const newContacts = [...section.data.clientContacts];
                    newContacts[index].title = e.target.value;
                    updateSectionData(section.id, {
                      clientContacts: newContacts,
                    });
                  }}
                  placeholder="Client title"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={contact.phone}
                  onChange={(e) => {
                    const newContacts = [...section.data.clientContacts];
                    newContacts[index].phone = e.target.value;
                    updateSectionData(section.id, {
                      clientContacts: newContacts,
                    });
                  }}
                  placeholder="Client phone"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => {
                    const newContacts = [...section.data.clientContacts];
                    newContacts[index].email = e.target.value;
                    updateSectionData(section.id, {
                      clientContacts: newContacts,
                    });
                  }}
                  placeholder="Client email"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Department</Label>
                <Input
                  value={contact.department}
                  onChange={(e) => {
                    const newContacts = [...section.data.clientContacts];
                    newContacts[index].department = e.target.value;
                    updateSectionData(section.id, {
                      clientContacts: newContacts,
                    });
                  }}
                  placeholder="Client department"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Signatures</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4 border-blue-200">
            <h5 className="font-medium text-blue-700 mb-4">Client Signature</h5>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Signature</Label>
                <Input
                  value={section.data.signatures.clientSignature}
                  onChange={(e) =>
                    updateSectionData(section.id, {
                      signatures: {
                        ...section.data.signatures,
                        clientSignature: e.target.value,
                      },
                    })
                  }
                  placeholder="Client signature"
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={section.data.signatures.clientName}
                  onChange={(e) =>
                    updateSectionData(section.id, {
                      signatures: {
                        ...section.data.signatures,
                        clientName: e.target.value,
                      },
                    })
                  }
                  placeholder="Client name"
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={section.data.signatures.clientTitle}
                  onChange={(e) =>
                    updateSectionData(section.id, {
                      signatures: {
                        ...section.data.signatures,
                        clientTitle: e.target.value,
                      },
                    })
                  }
                  placeholder="Client title"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={section.data.signatures.clientDate}
                  onChange={(e) =>
                    updateSectionData(section.id, {
                      signatures: {
                        ...section.data.signatures,
                        clientDate: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-red-200">
            <h5 className="font-medium text-red-700 mb-4">Company Signature</h5>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Signature</Label>
                <Input
                  value={section.data.signatures.companySignature}
                  onChange={(e) =>
                    updateSectionData(section.id, {
                      signatures: {
                        ...section.data.signatures,
                        companySignature: e.target.value,
                      },
                    })
                  }
                  placeholder="Company signature"
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={section.data.signatures.companyName}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={section.data.signatures.companyTitle}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={section.data.signatures.companyDate}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Next Steps</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newSteps = [...section.data.nextSteps, ""];
                updateSectionData(section.id, { nextSteps: newSteps });
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (section.data.nextSteps.length > 1) {
                  const newSteps = section.data.nextSteps.slice(0, -1);
                  updateSectionData(section.id, { nextSteps: newSteps });
                }
              }}
              disabled={section.data.nextSteps.length <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {section.data.nextSteps.map((step: string, index: number) => (
            <div key={index} className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex-shrink-0">
                {index + 1}
              </div>
              <Input
                value={step}
                onChange={(e) => {
                  const newSteps = [...section.data.nextSteps];
                  newSteps[index] = e.target.value;
                  updateSectionData(section.id, { nextSteps: newSteps });
                }}
                placeholder={`Next step ${index + 1}...`}
                className="flex-1"
              />
              {section.data.nextSteps.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newSteps = section.data.nextSteps.filter(
                      (_: any, i: number) => i !== index
                    );
                    updateSectionData(section.id, { nextSteps: newSteps });
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <Textarea
          id="additionalNotes"
          value={section.data.additionalNotes}
          onChange={(e) =>
            updateSectionData(section.id, { additionalNotes: e.target.value })
          }
          rows={4}
          placeholder="Any additional notes or special considerations..."
        />
      </div>
    </div>
  );

  const renderSection = (section: QuotationSection) => {
    switch (section.type) {
      case "cover_page":
        return renderCoverPage(section);
      case "executive_summary":
        return renderExecutiveSummary(section);
      case "company_introduction":
        return renderCompanyIntroduction(section);
      case "problem_statement":
        return renderProblemStatement(section);
      case "solution_details":
        return renderSolutionDetails(section);
      case "product_specifications":
        return renderProductSpecifications(section);
      case "quotation_items":
        return renderQuotationItems(section);
      case "timeline_schedule":
        return renderTimelineSchedule(section);
      case "terms_warranties":
        return renderTermsWarranties(section);
      case "contact_information":
        return renderContactInformation(section);
      default:
        return (
          <div className="space-y-4">
            <Label>Section Content</Label>
            <Textarea
              value={JSON.stringify(section.data, null, 2)}
              onChange={(e) => {
                try {
                  const newData = JSON.parse(e.target.value);
                  updateSectionData(section.id, newData);
                } catch (error) {
                  // Invalid JSON, do nothing
                }
              }}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="bg-linear-to-r from-red-600 to-red-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isEditing ? "Edit Quotation" : "Create Professional Proposal"}
            </h1>
            <p className="text-red-100 mt-1 text-lg">
              {isEditing
                ? `Editing: ${quotationData.quotationNumber}`
                : "Build comprehensive proposals with 10 customizable sections"}
            </p>
            {savedQuotationId && (
              <p className="text-red-200 text-sm mt-1">
                Saved as: {savedQuotationId}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={saveAsDraft}
              disabled={loadingStates.saveDraft || customersLoading}
            >
              {loadingStates.saveDraft ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={saveQuotation}
              disabled={loadingStates.saveQuotation || customersLoading}
            >
              {loadingStates.saveQuotation ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Save Quotation
                </>
              )}
            </Button>

            <Button
              className="bg-white text-red-600 hover:bg-red-50"
              onClick={generatePDF}
              disabled={loadingStates.generatePDF}
            >
              {loadingStates.generatePDF ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>




      {/* Template Selector and Proposal Sections in one row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Template Selector - Takes 3 columns */}
        <div className="lg:col-span-3">
          <TemplateSelector />
        </div>

        {/* Proposal Sections - Takes 9 columns */}
        <div className="lg:col-span-9">
          <Card className="mb-1 max-w-400 p-0 overflow-hidden">
            {/* HEADER SECTION - Exactly like TemplateSelector */}
            <div className="px-3 py-2 flex items-center justify-between min-h-[40px]">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold">Sections</span>

              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsProposalSectionsVisible(!isProposalSectionsVisible)}
                className="h-6 w-6"
              >
                {isProposalSectionsVisible ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* CONTENT SECTION - Zero height when hidden */}
            <div
              className={`
          transition-all duration-300 ease-in-out 
          overflow-hidden
          ${isProposalSectionsVisible ? "max-h-[300px]" : "max-h-0"}
        `}
            >
              {/* Inner wrapper to ensure no extra space */}
              <div className={isProposalSectionsVisible ? "p-3" : "p-0"}>
                {/* ULTRA COMPACT: 2 columns grid with very small spacing */}
                <div className="grid grid-cols-2 gap-1.5">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, section.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, section.id)}
                      className={`p-1.5 rounded-md border cursor-move transition-all flex items-center justify-between ${section.enabled
                          ? "border-green-300 bg-green-50 hover:border-green-400"
                          : "border-gray-200 bg-gray-50 opacity-70"
                        }`}
                    >
                      {/* Left side: Section info */}
                      <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                        <div className="w-4 h-4 flex items-center justify-center rounded bg-gray-100 text-gray-600 text-xs font-bold flex-shrink-0">
                          {section.order}
                        </div>
                        <span
                          className={`text-xs font-medium truncate ${section.enabled ? "text-gray-800" : "text-gray-500"
                            }`}
                        >
                          {section.title.split(" ")[0]}
                        </span>
                      </div>

                      {/* Right side: Controls */}
                      <div className="flex items-center space-x-0.5 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0"
                          onClick={() =>
                            moveSection(index, Math.max(0, index - 1))
                          }
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-2 w-2" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0"
                          onClick={() =>
                            moveSection(
                              index,
                              Math.min(sections.length - 1, index + 1)
                            )
                          }
                          disabled={index === sections.length - 1}
                        >
                          <ArrowDown className="h-2 w-2" />
                        </Button>
                        <Checkbox
                          checked={section.enabled}
                          onCheckedChange={() => toggleSection(section.id)}
                          className="h-3 w-3 ml-0.5"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>



      {customersError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 text-sm">
              {customersError.includes("index")
                ? "Optimizing customer data loading... Please wait a few minutes."
                : customersError}
            </span>
          </div>
        </div>
      )}



      <Card className="mb-6 p-0 overflow-hidden">
        {/* HEADER - Minimal possible space */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-sm font-semibold leading-none">Basic Information</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsBasicInfoVisible(!isBasicInfoVisible)}
            className="h-6 w-6"
          >
            {isBasicInfoVisible ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* CONTENT SECTION - Zero height when hidden */}
        <div
          className={`
      transition-all duration-300 ease-in-out 
      overflow-hidden
      ${isBasicInfoVisible ? "max-h-[500px]" : "max-h-0"}
    `}
        >
          {/* Inner wrapper */}
          <div className={isBasicInfoVisible ? "p-6 pt-0" : "p-0"}>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quotationNumber">Quotation Number</Label>
                  <Input
                    id="quotationNumber"
                    value={quotationData.quotationNumber}
                    onChange={(e) =>
                      setQuotationData((prev) => ({
                        ...prev,
                        quotationNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select
                    value={quotationData.customerId}
                    onValueChange={(value) =>
                      setQuotationData((prev) => ({
                        ...prev,
                        customerId: value,
                      }))
                    }
                    disabled={customersLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          customersLoading
                            ? "Loading customers..."
                            : "Select a customer"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.companyName} - {customer.primaryContact.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {customersLoading && (
                    <p className="text-sm text-gray-500 flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Loading customers...
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={quotationData.issueDate}
                    onChange={(e) =>
                      setQuotationData((prev) => ({
                        ...prev,
                        issueDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={quotationData.validUntil}
                    onChange={(e) =>
                      setQuotationData((prev) => ({
                        ...prev,
                        validUntil: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>





      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main sections content with responsive width */}
        <div
          className={`lg:col-span-4 space-y-6 transition-all duration-300 ease-in-out`}
        >
          {sections
            .filter((section) => section.enabled)
            .map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Eye className="h-5 w-5 text-green-600" />
                      <div>
                        <CardTitle className="text-xl">
                          {section.title}
                        </CardTitle>
                        <CardDescription>
                          Section {section.order} • Enabled for PDF
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="default">PDF</Badge>
                  </div>
                </CardHeader>
                <CardContent>{renderSection(section)}</CardContent>
              </Card>
            ))}
        </div>
      </div>


    </div>
  );
}
















