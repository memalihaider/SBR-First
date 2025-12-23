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
import { Switch } from "@/components/ui/switch";

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
  Edit3,
  Info,
  Layers,
  ArrowDown,
  Plus,
  Minus,
  Bot,
  CheckCircle2,
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
  Building,
  User,
  Loader2,
  AlertTriangle,
  Upload,
  Link,
  Calendar,
  Shield,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Settings, Wrench, Check } from "lucide-react"; // Gear icon ke liye

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

///pdf
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

  const margin = 5;
  const margin1=10;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = 0;
  let currentPage = 1;

  // NEW FOOTER FUNCTION WITH 2 ROWS
  // NEW FOOTER FUNCTION WITH 14 IMAGES IN 2 ROWS

const addFooterToEveryPage = () => {
    const footerY = pageHeight - 30;

    // CONTACT INFO ROW: Sabse UPER (grey line se upar)
    const contactInfoY = footerY - 1;

    // Grey line position - contact info ke neeche
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);

    const lineStartX = margin;
    const lineEndX = pageWidth - margin;
    const greyLineY = footerY; // Contact info ke neeche
    pdf.line(lineStartX, greyLineY, lineEndX, greyLineY);

    // TEXT ROWS: Grey line ke UPER (contact info aur brand names)
    const textRow1Y = greyLineY - 2;  // Brand names (KNX, Google Home, etc.)
    const textRow2Y = greyLineY +2;  // Second row of brand names


    // IMAGE ROWS: Grey line ke NEE CHE
    const imageRow1Y = greyLineY + 2;  // First image row
    const imageRow2Y = greyLineY + 10; // Second image row

    const defaultIconSize = 10; // Default size for icons
    const imagesPerRow = 7;
    const totalImages = 14;

    const lineWidth = lineEndX - lineStartX;
    const iconSpacing = lineWidth / (imagesPerRow -1);

    try {
      // STEP 1: CONTACT INFORMATION - GREY LINE KE UPER (SABSE UPER)
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");

      // Website (Left)
      pdf.text("www.sbrsystem.ae", lineStartX, contactInfoY);

      // Email (Center)
      const centerX = pageWidth / 2;
      pdf.text("info@sbrsystem.ae", centerX, contactInfoY, { align: "center" });

      // Address (Right)
      pdf.setFontSize(7);
      pdf.text(
        "Address: Office AB0910, JAFZA One, Dubai, UAE",
        lineEndX,
        contactInfoY,
        { align: "right" }
      );

      const iconConfigs = [
        // Row 1 icons with custom sizes + top positions + LEFT adjustment
        { name: "parad.png", width: 13, height: 3, top: 0, left: 6 },  // Paradigm
        { name: "basal.jpeg", width: 11, height: 3, top: 0, left: 0 }, // Basalte
        { name: "control.png", width: 17, height: 5, top: 0, left: 0 }, // Control4
        { name: "lut.png", width: 17, height: 3, top: 0, left: 0 },     // Lutron
        { name: "hik.png", width: 15, height: 4.5, top: 0, left: 0 },   // Hikvision
        { name: "ubi.png", width: 18, height: 7, top: 0, left: 0 },     // Ubiquiti
        { name: "sonoss.png", width: 13, height: 3, top: 0, left: -6 },  // Sonos    

        // Row 2 icons with custom sizes + top positions + LEFT adjustment
        { name: "google.png", width: 11, height: 6, top: 0, left: 5 }, // Google
        { name: "alexa.png", width: 10, height: 6, top: 0, left: 0 },  // Alexa
        { name: "nest.png", width: 10, height: 6, top: 0, left: 0 },   // Nest
        { name: "omc.png", width: 10, height: 4, top: 0, left: 0 },    // OMC
        { name: "eufy.png", width: 12, height: 12, top: 0, left: 0 },  // Eufy 
        { name: "anthemm.jpg", width: 20, height: 4, top: 0, left: 0 }, // Anthem
        { name: "knx.png", width: 10, height: 5, top: 0, left: -6 }     // KNX
      ];

      // BRAND NAMES - Grey line ke upar (contact info ke neeche)
      const textRow1Names = [
        ""
      ];

      const textRow2Names = [
       ""
      ];

      // STEP 2: Draw BRAND NAMES TEXT - Grey line ke upar
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(5);
      pdf.setFont("helvetica", "normal");

      // First row of brand names
      for (let i = 0; i < imagesPerRow; i++) {
        if (textRow1Names[i]) {
          const textX = lineStartX + i * iconSpacing;
          pdf.text(textRow1Names[i], textX,  textRow1Y, { align: "center" });
        }
      }

      // Second row of brand names
      for (let i = 0; i < textRow2Names.length; i++) {
        if (textRow2Names[i]) {
          const textX = lineStartX + i * iconSpacing;
          pdf.text(textRow2Names[i], textX, textRow2Y, { align: "center" });
        }
      }

      // STEP 3: Draw IMAGES with CUSTOM SIZES and LEFT adjustment - GREY LINE KE NEE CHE
      // First row of images
      for (let i = 0; i < imagesPerRow; i++) {
        const config = iconConfigs[i];
        const iconWidth = config.width;
        const iconHeight = config.height;
        const iconLeft = config.left || 0; // LEFT adjustment value

        // Calculate center position for each icon WITH LEFT adjustment
        const iconX = lineStartX + i * iconSpacing - iconWidth / 2 + iconLeft;

        try {
          pdf.addImage(
            `/${config.name}`,
            "PNG",
            iconX,
            imageRow1Y,
            iconWidth,
            iconHeight
          );
        } catch (error) {
          console.error(`Error loading ${config.name}:`, error);
          // Fallback with custom size
          pdf.setFillColor(245, 245, 245);
          pdf.rect(iconX, imageRow1Y, iconWidth, iconHeight, "F");

          pdf.setTextColor(80, 80, 80);
          pdf.setFontSize(4);
          pdf.setFont("helvetica", "bold");
          pdf.text(
            textRow1Names[i] || "LOGO",
            iconX + iconWidth / 2,
            imageRow1Y + iconHeight / 2,
            { align: "center" }
          );
        }
      }

      // Second row of images
      for (let i = imagesPerRow; i < totalImages; i++) {
        const row2Index = i - imagesPerRow;
        const config = iconConfigs[i];
        const iconWidth = config.width;
        const iconHeight = config.height;
        const iconLeft = config.left || 0; // LEFT adjustment value

        const iconX = lineStartX + row2Index * iconSpacing - iconWidth / 2 + iconLeft;

        try {
          pdf.addImage(
            `/${config.name}`,
            "PNG",
            iconX,
            imageRow2Y,
            iconWidth,
            iconHeight
          );
        } catch (error) {
          console.error(`Error loading ${config.name}:`, error);
          // Fallback with custom size
          pdf.setFillColor(245, 245, 245);
          pdf.rect(iconX, imageRow2Y, iconWidth, iconHeight, "F");

          pdf.setTextColor(80, 80, 80);
          pdf.setFontSize(4);
          pdf.setFont("helvetica", "bold");
          pdf.text(
            textRow2Names[row2Index] || "LOGO",
            iconX + iconWidth / 2,
            imageRow2Y + iconHeight / 2,
            { align: "center" }
          );
        }
      }

    } catch (error) {
      console.error("Footer error:", error);
      // Simple fallback
      const fallbackY = footerY + 10;
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        "www.sbrsystem.ae | info@sbrsystem.ae | Office AB0910, JAFZA One, Dubai, UAE",
        pageWidth / 2,
        fallbackY,
        { align: "center" }
      );
    }
  };

  // footer

  // Helper functions

  const addHeaderToEveryPage = () => {
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, 30, "F");

    // LOGO SECTION (Left side)
    const logoX = 5;
    const logoY = 5;
    const logoWidth = 59;
    const logoHeight = 17;

    let logoLoaded = false;

    try {
      const possiblePaths = ["/sbr.png", window.location.origin + "/sbr.png"];

      for (const path of possiblePaths) {
        try {
          pdf.addImage(path, "PNG", logoX, logoY, logoWidth, logoHeight);
          logoLoaded = true;
          break;
        } catch (err) {
          continue;
        }
      }

      if (!logoLoaded) {
        throw new Error("All paths failed");
      }
    } catch (error) {
      pdf.setFillColor(0, 51, 102);
      pdf.rect(logoX, logoY, logoWidth, logoHeight, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      const centerX = logoX + logoWidth / 2;
      const centerY = logoY + logoHeight / 2;
      pdf.text("SBR", centerX, centerY, { align: "center" });
    }

    // TEXT BELOW LOGO
    const textBelowImageY = logoY + logoHeight + 7;
    pdf.setTextColor(0, 51, 102);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    const imageCenterX = logoX + logoWidth / 2;
    const textLeftShift = 0;
    const textX = imageCenterX + textLeftShift;
    pdf.text("Smart Building Revolution", textX, textBelowImageY, {
      align: "center",
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11.5);
    pdf.setTextColor(128, 128, 128); // GREY color (RGB: 128,128,128)
    const phoneText = "Phone: +971 4 229 3610";
    pdf.text(phoneText, pageWidth - 5, 23, { align: "right" }); // Right: -15 se -10, Top: 10 se 15

    // QUOTATION BOX with TRN inside (Center)
    pdf.setFillColor(0, 51, 102); // Dark blue background

    // Make box wider to fit both "QUOTATION" and TRN
    const quotationWidth = 280; // Increased from 240 to 280
    const quotationHeight = 10;
    const quotationX = pageWidth / 2 - quotationWidth / 2;
    const quotationY = 25;
    pdf.rect(quotationX, quotationY, quotationWidth, quotationHeight, "F");

    // QUOTATION text (Left side inside blue box)
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    const textY = quotationY + quotationHeight / 2 + 2;

    // "QUOTATION" on left side of box
    const quotationTextX = quotationX + 124; // 10px from left of box
    pdf.text("QUOTATION", quotationTextX, textY -1, { align: "left" });

    // TRN text (Right side inside same blue box)
   pdf.setFontSize(11);
pdf.setFont("helvetica", "bold");
const trnText = "TRN: 104122809700003";
const trnTextX = quotationX + quotationWidth - 40; // 10px from right of box
pdf.text(trnText, trnTextX, textY - 1.5, { align: "right" }); // CHANGED: textY se textY - 2

    // Separator line below header
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(0, 33, pageWidth, 33);

    pdf.setTextColor(0, 0, 0); // Reset text color
  };

  const checkPageBreak = (requiredSpace: number) => {
  // Footer height = 50px, Buffer = 10px (footer se 10px uper rakhna)
  const footerBuffer = 30; // Footer height + 10px buffer

  if (yPosition + requiredSpace > pageHeight - footerBuffer) {
    pdf.addPage();
    currentPage++;
    yPosition = 50;
    addHeaderToEveryPage();
    return true;
  }
  return false;
};

  const addText = (
    text: string,
    x: number,
    y: number,
    fontSize: number = 10,
    isBold: boolean = false,
    align: "left" | "center" | "right" = "left"
  ) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", isBold ? "bold" : "normal");
    pdf.text(text, x, y, { align });
  };

  const drawLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color = [200, 200, 200],
    width = 0.5
  ) => {
    pdf.setDrawColor(color[0], color[1], color[2]);
    pdf.setLineWidth(width);
    pdf.line(x1, y1, x2, y2);
  };


  const addSectionHeader = (title: string, sectionNumber: number) => {
  checkPageBreak(20);

  pdf.setFillColor(245, 245, 245);
  drawLine(
    margin1,
    yPosition,
    pageWidth - margin1,
    yPosition,
    [100, 100, 100],
    0.8
  );
  drawLine(
    margin1,
    yPosition + 12,
    pageWidth - margin1,
    yPosition + 12,
    [100, 100, 100],
    0.8
  );

  // Blue circle - RIGHT movement (+2px)
  pdf.setFillColor(59, 130, 246);
  pdf.circle(margin1 + 4, yPosition + 6, 4, "F"); // CHANGED: +7 to +9 (2px right)
  pdf.setTextColor(255, 255, 255);
  addText(
    sectionNumber.toString(),
    margin1 + 4, // CHANGED: +7 to +9 (same as circle)
    yPosition + 7.5,
    9,
    true,
    "center"
  );

  // Text - LEFT movement (-2px)
  pdf.setTextColor(50, 50, 50);
  addText(title.toUpperCase(), margin1 + 10, yPosition + 8, 12, true); // CHANGED: +20 to +18 (2px left)

  yPosition += 17;
  pdf.setTextColor(0, 0, 0);
};


const addFormattedText = (
  text: string,
  fontSize: number = 11,
  isBold: boolean = false,
  leftMargin: number = margin1
) => {
  if (!text) return;

  const originalFontSize = pdf.getFontSize();
  const originalFont = pdf.getFont().fontName;
  const originalFontStyle = pdf.getFont().fontStyle;

  pdf.setFontSize(fontSize);
  pdf.setFont("helvetica", isBold ? "bold" : "normal");

  const textWidth = pageWidth - leftMargin - 10;
  const lines = pdf.splitTextToSize(text, textWidth);

  // Footer buffer
  const footerBuffer = 60;

  lines.forEach((line: string) => {
    checkPageBreak(6);

    if (yPosition > pageHeight - footerBuffer) {
      pdf.addPage();
      currentPage++;
      yPosition = 50;
      addHeaderToEveryPage();

      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");
    }

    pdf.text(line, leftMargin, yPosition);
    yPosition += 5;
  });

  yPosition += 3;

  pdf.setFontSize(originalFontSize);
  pdf.setFont(originalFont as string, originalFontStyle as string);
};

  const addBulletList = (items: string[], fontSize: number = 10, leftMargin: number = margin1) => {
  items.forEach((item: string, index: number) => {
    if (item.trim()) {
      checkPageBreak(12);

      // Calculate Y position for bullet and text (same line)
      const bulletY = yPosition + 3; // Adjusted for better alignment
      const textY = yPosition + 4; // Same Y for text

      // Circle with number - better positioned
      pdf.setFillColor(59, 130, 246);
      pdf.circle(leftMargin + 3, bulletY, 2.5, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7); // Smaller font
      pdf.text((index + 1).toString(), leftMargin + 3, bulletY + 1, {
        align: "center",
      });

      // Item text - start from bullet position
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", "normal");

      const itemLines = pdf.splitTextToSize(item, contentWidth - 15);

      // First line starts from bullet
      if (itemLines[0]) {
        pdf.text(itemLines[0], leftMargin + 12, textY);
        yPosition += 5; // Move down after first line
      }

      // Remaining lines (if any)
      for (let lineIndex = 1; lineIndex < itemLines.length; lineIndex++) {
        checkPageBreak(6);

        if (yPosition > pageHeight - leftMargin - 10) {
          pdf.addPage();
          currentPage++;
          yPosition = 50;
          addHeaderToEveryPage();
          pdf.setFontSize(fontSize);
          pdf.setFont("helvetica", "normal");
        }

        pdf.text(itemLines[lineIndex], leftMargin + 10, yPosition);
        yPosition += 5;
      }

      yPosition += 2;

      // Separator line - at current Y position
      if (index < items.length - 1) {
        drawLine(
          leftMargin + 10,
          yPosition - 1,
          pageWidth - leftMargin,
          yPosition - 1,
          [240, 240, 240]
        );
        yPosition += 2;
      }
    }
  });

  yPosition += 8; // Slightly less space after list
};

yPosition = margin1;
addHeaderToEveryPage();
yPosition = 44;

addText("CUSTOMER", margin1, yPosition, 12, true);
  yPosition += 6;

  const customer = customers.find((c) => c.id === quotationData.customerId);
  if (customer) {
    addText(customer.name || "CHERWELL INTERIOR LLC", margin1, yPosition, 10);
    yPosition += 6;
    addText(
      customer.address || "National Industries Park Dubai, U.A.E.",
      margin1,
      yPosition,
      9
    );
    yPosition += 6;
    addText(`TRN: ${customer.trn || "104077229620000"}`, margin1, yPosition, 10);
    yPosition += 6;
    addText(
      `Project: ${quotationData.projectName || "Q045 Polo Home"}`,
      margin1,
      yPosition,
      10
    );
    yPosition += 6;
    addText(
      `SUBJECT: ${
        quotationData.subject ||
        "Quotation for Smart Home Automation, ELV System"
      }`,
      margin1,
      yPosition,
      10
    );
  } else {
    addText("CHERWELL INTERIOR LLC", margin1, yPosition, 10);
    yPosition += 6;
    addText("National Industries Park Dubai, U.A.E.", margin1, yPosition, 10);
    yPosition +=6;
    addText("TRN: 104077229620000", margin1, yPosition, 10);
    yPosition += 6;
    addText("Project: Q045 Polo Home", margin1, yPosition, 10);
    yPosition += 6;
    addText(
      "SUBJECT: Quotation for Smart Home Automation, ELV System",
      margin1,
      yPosition,
      6
    );
  }

  yPosition += 8;

  addText(
    `SR NO: ${quotationData.quotationNumber || "QT-CW-25-017"}`,
    pageWidth - margin1,
    50,
    10,
    false,
    "right"
  );
  addText(
    `DATE: ${quotationData.date || "31.10.2025"}`,
    pageWidth - margin1,
    56,
    10,
    false,
    "right"
  );

  yPosition += 0;



  const enabledSections = sections.filter((s) => s.enabled);
let sectionNumber = 1;

const coverSection = enabledSections.find((s) => s.type === "cover_page");
if (coverSection) {
  addSectionHeader("COVER LETTER", sectionNumber++);
  checkPageBreak(30);

  if (coverSection.data.subject) {
    addText(coverSection.data.subject, margin1, yPosition, 14, true);
    yPosition += 10;
  } else {
    addText("Quotation", margin1, yPosition, 14, true);
    yPosition += 10;
  }

  if (coverSection.data.letterContent) {
    addFormattedText(coverSection.data.letterContent, 10, false, margin1); // margin1 added
    yPosition += 0;
  } else {
    yPosition += 0;
  }
}

  const execSection = enabledSections.find(
    (s) => s.type === "executive_summary"
  );
  if (execSection) {
    addSectionHeader("EXECUTIVE SUMMARY", sectionNumber++);
    checkPageBreak(30);

    if (execSection.data.summary) {
      addFormattedText(execSection.data.summary,10, false,margin1);
      yPosition += 3;
    }

    if (
      execSection.data.keyBenefits &&
      execSection.data.keyBenefits.length > 0
    ) {
      checkPageBreak(30);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 130, 246);
      pdf.text("KEY BENEFITS", margin1, yPosition);
      pdf.setTextColor(0, 0, 0);

      yPosition += 5;
      drawLine(
        margin1,
        yPosition - 2,
        margin1 + 50,
        yPosition - 2,
        [59, 130, 246],
        1
      );
      yPosition += 3;

      addBulletList(execSection.data.keyBenefits, 10);
    } else {
      yPosition += 0;
    }
  }

  const companySection = enabledSections.find(
    (s) => s.type === "company_introduction"
  );
  if (companySection) {
    addSectionHeader("COMPANY PROFILE", sectionNumber++);
    checkPageBreak(30);

    if (companySection.data.description) {
      addFormattedText(companySection.data.description, 11, false,margin1);
    }

    if (
      companySection.data.achievements &&
      companySection.data.achievements.length > 0
    ) {
      checkPageBreak(30);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 130, 246);
      pdf.text("OUR ACHIEVEMENTS", margin1, yPosition);
      pdf.setTextColor(0, 0, 0);

      yPosition += 5;
      drawLine(
        margin1,
        yPosition - 2,
        margin + 60,
        yPosition - 2,
        [59, 130, 246],
        1
      );
      yPosition += 5;

      addBulletList(companySection.data.achievements, 10);
    } else {
      yPosition += 10;
    }

    checkPageBreak(30);
  }

  const problemSection = enabledSections.find(
    (s) => s.type === "problem_statement"
  );
  if (problemSection) {
    addSectionHeader("PROBLEM STATEMENT", sectionNumber++);
    checkPageBreak(30);

    if (problemSection.data.currentSituation) {
      addFormattedText(problemSection.data.currentSituation, 11, false,margin1);
    }

    if (
      problemSection.data.objectives &&
      problemSection.data.objectives.length > 0
    ) {
      checkPageBreak(30);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 130, 246);
      pdf.text("PROJECT OBJECTIVES", margin1, yPosition);
      pdf.setTextColor(0, 0, 0);

      yPosition += 5;
      drawLine(
        margin1,
        yPosition - 2,
        margin1 + 70,
        yPosition - 2,
        [59, 130, 246],
        1
      );
      yPosition += 10;

      addBulletList(problemSection.data.objectives, 10);
    } else {
      yPosition += 0;
    }

    checkPageBreak(30);
  }

  const solutionSection = enabledSections.find(
    (s) => s.type === "solution_details"
  );
  if (solutionSection) {
    addSectionHeader("SOLUTION DETAILS", sectionNumber++);
    checkPageBreak(30);

    if (solutionSection.data.approach) {
      addFormattedText(solutionSection.data.approach, 11, false,margin1);
    }

    if (
      solutionSection.data.keyFeatures &&
      solutionSection.data.keyFeatures.length > 0
    ) {
      checkPageBreak(30);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 130, 246);
      pdf.text("KEY FEATURES", margin1, yPosition);
      pdf.setTextColor(0, 0, 0);

      yPosition += 5;
      drawLine(
        margin1,
        yPosition - 2,
        margin + 50,
        yPosition - 2,
        [59, 130, 246],
        1
      );
      yPosition += 10;

      addBulletList(solutionSection.data.keyFeatures, 10);
    } else {
      yPosition += 0;
    }

    checkPageBreak(30);
  }



  const agreementSection = enabledSections.find(
  (s) => s.type === "product_specifications"
);
if (agreementSection) {
  addSectionHeader("SERVICE AGREEMENT", sectionNumber++);
  checkPageBreak(45);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("Service Agreement", margin1, yPosition);
  yPosition += 4;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(
    "Define terms, conditions, and signatures for the agreement",
    margin1,
    yPosition
  );
  yPosition += 10;

  const columnWidth = contentWidth / 2 - 10;
  const leftColumnX = margin1;
  const rightColumnX = margin1 + columnWidth + 20;

  let leftColumnY = yPosition;
  let rightColumnY = yPosition;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Company Signature", leftColumnX, leftColumnY);
  leftColumnY += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Company Name", leftColumnX, leftColumnY);
  leftColumnY += 4;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(
    agreementSection.data.companyName || "_________________",
    leftColumnX,
    leftColumnY
  );
  leftColumnY += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Designation", leftColumnX, leftColumnY);
  leftColumnY += 4;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(
    agreementSection.data.companyDesignation || "_________________",
    leftColumnX,
    leftColumnY
  );
  leftColumnY += 6;

  leftColumnY += 3;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Company signature", leftColumnX, leftColumnY);
  leftColumnY += 4;

  if (agreementSection.data.companySignature) {
    try {
      const imgWidth = 60;
      const imgHeight = 25;
      pdf.addImage(
        agreementSection.data.companySignature,
        "PNG",
        leftColumnX,
        leftColumnY,
        imgWidth,
        imgHeight
      );
      leftColumnY += imgHeight + 3;
    } catch (error) {
      drawLine(
        leftColumnX,
        leftColumnY + 5,
        leftColumnX + 80,
        leftColumnY + 5,
        [0, 0, 0]
      );
      leftColumnY += 12;
    }
  } else {
    drawLine(
      leftColumnX,
      leftColumnY + 5,
      leftColumnX + 80,
      leftColumnY + 5,
      [0, 0, 0]
    );
    leftColumnY += 12;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Client Signature", rightColumnX, rightColumnY);
  rightColumnY += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Client Name", rightColumnX, rightColumnY);
  rightColumnY += 4;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(
    agreementSection.data.clientName || "_________________",
    rightColumnX,
    rightColumnY
  );
  rightColumnY += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Designation", rightColumnX, rightColumnY);
  rightColumnY += 4;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(
    agreementSection.data.clientOrganization || "_________________",
    rightColumnX,
    rightColumnY
  );
  rightColumnY += 6;

  rightColumnY += 3;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Client Signature ", rightColumnX, rightColumnY);
  rightColumnY += 6;

  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text("_______________________", rightColumnX + 25, rightColumnY + 6);
  pdf.setTextColor(0, 0, 0);

  rightColumnY += 15;

  yPosition = Math.max(leftColumnY, rightColumnY) + 15;
  checkPageBreak(20);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Agreement Details", margin1, yPosition);
  yPosition += 6;

  const rowY = yPosition;
  const itemWidth = contentWidth / 3;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Agreement Date", margin1, rowY);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  const agreementDate = agreementSection.data.agreementDate || "2025-12-18";
  pdf.text(agreementDate, margin1, rowY + 5);

  const idX = margin1 + itemWidth;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Agreement ID", idX, rowY);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  const agreementId =
    agreementSection.data.agreementId ||
    `AGR-${Date.now().toString().slice(-6)}`;
  pdf.text(agreementId, idX, rowY + 5);

  const validityX = margin1 + itemWidth * 2;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Validity Period (Days)", validityX, rowY);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  const validity = agreementSection.data.validityPeriod || "365";
  pdf.text(`${validity} days`, validityX, rowY + 5);

  yPosition = rowY + 15;

  if (agreementSection.data.generalNotes) {
    checkPageBreak(10);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("General Notes & Remarks", margin1, yPosition);
    yPosition += 4;

    addFormattedText(agreementSection.data.generalNotes, 8, false, margin1);
    yPosition += 4;
  }

  checkPageBreak(15);
  yPosition += 4;

  const centerX = pageWidth / 2;
  const sigY = yPosition;

  drawLine(margin1, sigY + 3, margin1 + 80, sigY + 3, [0, 0, 0]);
  pdf.setFontSize(8);
  pdf.text("Authorized Signatory", margin1 + 20, sigY + 8);

  drawLine(
    pageWidth - margin1 - 80,
    sigY + 3,
    pageWidth - margin1,
    sigY + 3,
    [0, 0, 0]
  );
  pdf.text("Client Signature", pageWidth - margin1 - 60, sigY + 8);

  yPosition += 14;
}

  const quotationSection = enabledSections.find(
    (s) => s.type === "quotation_items"
  );
  if (quotationSection) {
    addSectionHeader("QUOTATION DETAILS", sectionNumber++);

    if (quotationSection.data.items && quotationSection.data.items.length > 0) {
      const visibleItems = quotationSection.data.items.filter(
        (item: QuotationItem) => {
          return !quotationData.deletedFields?.[item.id];
        }
      );

      const visibleTitles =
        quotationSection.data.titles?.filter((title: QuotationTitle) => {
          return !quotationData.deletedFields?.[title.id];
        }) || [];

      const colPositions = {
        srNo: margin,
        image: margin + 10,
        product: margin + 18,
        partNo: margin + 53,
        qty: margin + 73,
        rate: margin + 88,
        tax: margin + 113,
        disc: margin + 128,
        total: margin + 138,
      };

      let titleCounter = 1;
      let grandSubtotal = 0;

      for (const title of visibleTitles) {
        const titleItems = visibleItems.filter(
          (item: QuotationItem) => item.titleId === title.id
        );

        if (titleItems.length > 0) {
          checkPageBreak(25);

          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, yPosition, contentWidth, 10, "F");
          drawLine(
            margin,
            yPosition,
            pageWidth - margin,
            yPosition,
            [220, 220, 220]
          );

          addText(
            `${titleCounter}. ${title.title}`,
            margin + 5,
            yPosition + 7,
            12,
            true
          );
          addText(
            `(${titleItems.length} items)`,
            margin + contentWidth - 5,
            yPosition + 7,
            10,
            false,
            "right"
          );

          yPosition += 14;
          titleCounter++;

          checkPageBreak(20);

          pdf.setFillColor(245, 245, 245);
          pdf.rect(margin, yPosition, contentWidth, 8, "F");

          pdf.setTextColor(60, 60, 60);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");

          pdf.text("#", colPositions.srNo + 4, yPosition + 5, {
            align: "center",
          });
          pdf.text("PRODUCT", colPositions.product + 15, yPosition + 5, {
            align: "center",
          });
          pdf.text("PART", colPositions.partNo + 7, yPosition + 5, {
            align: "center",
          });
          pdf.text("QTY", colPositions.qty + 5, yPosition + 5, {
            align: "center",
          });
          pdf.text("RATE", colPositions.rate + 10, yPosition + 5, {
            align: "right",
          });
          pdf.text("TAX%", colPositions.tax + 5, yPosition + 5, {
            align: "center",
          });
          pdf.text("DISC%", colPositions.disc + 5, yPosition + 5, {
            align: "center",
          });
          pdf.text("TOTAL", colPositions.total + 42, yPosition + 5, {
            align: "right",
          });

          pdf.setTextColor(0, 0, 0);
          yPosition += 10;

          drawLine(
            margin,
            yPosition - 2,
            pageWidth - margin,
            yPosition - 2,
            [100, 100, 100],
            0.5
          );

          let itemCounter = 1;
          let sectionSubtotal = 0;

          for (const item of titleItems) {
            const requiredRowHeight = 22;
            checkPageBreak(requiredRowHeight);

            if (itemCounter % 2 === 0) {
              pdf.setFillColor(252, 252, 252);
              pdf.rect(margin, yPosition, contentWidth, requiredRowHeight, "F");
            }

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(
              itemCounter.toString(),
              colPositions.srNo + 4,
              yPosition + 5,
              { align: "center" }
            );

            const imageY = yPosition + 1;
            const imageWidth = 4;
            const imageHeight = 4;

            if (item.images && item.images.length > 0 && item.images[0]) {
              try {
                pdf.addImage(
                  item.images[0],
                  "JPEG",
                  colPositions.image + 1,
                  imageY,
                  imageWidth,
                  imageHeight
                );
              } catch (error) {
                pdf.setFillColor(240, 240, 240);
                pdf.rect(
                  colPositions.image + 1,
                  imageY,
                  imageWidth,
                  imageHeight,
                  "F"
                );
              }
            } else {
              pdf.setFillColor(240, 240, 240);
              pdf.rect(
                colPositions.image + 1,
                imageY,
                imageWidth,
                imageHeight,
                "F"
              );
            }

            const productName = item.productName || "Product";
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(9);

            let displayProductName = productName;
            if (productName.length > 16) {
              displayProductName = productName.substring(0, 14) + "...";
            }
            pdf.text(
              displayProductName,
              colPositions.product + 2,
              yPosition + 5
            );

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            const partNo = item.sku || item.partNo || "";
            let displayPartNo = partNo;
            if (partNo.length > 4) {
              displayPartNo = partNo.substring(0, 15) + "...";
            }
            pdf.text(displayPartNo, colPositions.partNo + 2, yPosition + 5);

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(9);
            pdf.text(
              item.quantity.toString(),
              colPositions.qty + 5,
              yPosition + 5,
              { align: "center" }
            );

            const rateText = formatAmount(item.rate);
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            pdf.text(rateText, colPositions.rate + 15, yPosition + 5, {
              align: "right",
            });
            pdf.setFont("helvetica", "normal");

            pdf.setFontSize(8);
            if (item.tax > 0) {
              pdf.setTextColor(34, 139, 34);
              pdf.text(`${item.tax}%`, colPositions.tax + 5, yPosition + 5, {
                align: "center",
              });
            } else {
              pdf.setTextColor(150, 150, 150);
              pdf.text("0%", colPositions.tax + 5, yPosition + 5, {
                align: "center",
              });
            }

            if (item.discount > 0) {
              pdf.setTextColor(59, 130, 246);
              pdf.text(
                `${item.discount}%`,
                colPositions.disc + 5,
                yPosition + 5,
                { align: "center" }
              );
            } else {
              pdf.setTextColor(150, 150, 150);
              pdf.text("0%", colPositions.disc + 5, yPosition + 5, {
                align: "center",
              });
            }

            const itemAmount = item.quantity * item.rate;
            const discountAmount = itemAmount * (item.discount / 100);
            const amountAfterDiscount = itemAmount - discountAmount;
            const taxAmount = amountAfterDiscount * (item.tax / 100);
            const itemTotal = amountAfterDiscount + taxAmount;
            sectionSubtotal += itemTotal;
            grandSubtotal += itemTotal;

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            const totalText = formatAmount(itemTotal);

            const totalX = colPositions.total + 42;
            pdf.text(totalText, totalX, yPosition + 5, { align: "right" });

            const description = item.description || "";
            if (description) {
              pdf.setFont("helvetica", "italic");
              pdf.setFontSize(7);
              pdf.setTextColor(80, 80, 80);

              const descX = colPositions.product + 2;
              let displayDesc = description;

              if (description.length > 50) {
                displayDesc = description.substring(0, 100) + "...";
              }

              pdf.text(displayDesc, descX, yPosition + 12);
            }

            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "normal");

            drawLine(
              margin,
              yPosition + requiredRowHeight - 2,
              pageWidth - margin,
              yPosition + requiredRowHeight - 2,
              [240, 240, 240]
            );

            yPosition += requiredRowHeight;
            itemCounter++;
          }

          checkPageBreak(20);
          yPosition += 5;

          drawLine(
            colPositions.rate,
            yPosition,
            pageWidth - margin,
            yPosition,
            [200, 200, 200],
            0.5
          );

          pdf.setFillColor(250, 250, 250);
          pdf.rect(
            colPositions.rate,
            yPosition + 2,
            contentWidth - colPositions.rate + margin,
            10,
            "F"
          );

          pdf.setFontSize(8);
          pdf.setTextColor(80, 80, 80);
          pdf.text("Subtotal:", colPositions.total - 5, yPosition + 8, {
            align: "right",
          });

          pdf.setFontSize(9);
          pdf.setTextColor(0, 0, 0);
          pdf.setFont("helvetica", "bold");
          const subtotalText = formatAmount(sectionSubtotal);
          pdf.text(subtotalText, colPositions.total + 42, yPosition + 8, {
            align: "right",
          });
          pdf.setFont("helvetica", "normal");

          yPosition += 15;
        }
      }

      checkPageBreak(50);
      yPosition += 10;

      const baseSubtotal = visibleItems.reduce(
        (sum: number, item: QuotationItem) => {
          return sum + item.quantity * item.rate;
        },
        0
      );

      const totalDiscount = visibleItems.reduce(
        (sum: number, item: QuotationItem) => {
          const itemAmount = item.quantity * item.rate;
          return sum + itemAmount * (item.discount / 100);
        },
        0
      );

      const totalTax = visibleItems.reduce(
        (sum: number, item: QuotationItem) => {
          const itemAmount = item.quantity * item.rate;
          const discountAmount = itemAmount * (item.discount / 100);
          const amountAfterDiscount = itemAmount - discountAmount;
          return sum + amountAfterDiscount * (item.tax / 100);
        },
        0
      );

      const grandTotal = baseSubtotal - totalDiscount + totalTax;

      const summaryStartX = colPositions.rate;
      const summaryWidth = pageWidth - margin - summaryStartX;

      pdf.setFillColor(250, 250, 250);
      pdf.rect(summaryStartX, yPosition, summaryWidth, 35, "F");

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("SUMMARY", summaryStartX + 5, yPosition + 8);

      const summaryLabelX = summaryStartX + 10;
      const summaryValueX = summaryStartX + summaryWidth - 10;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");

      const summaryItems = [
        { label: "Subtotal:", value: baseSubtotal },
        { label: "Discount:", value: -totalDiscount },
        { label: "Tax:", value: totalTax },
      ];

      summaryItems.forEach((item, index) => {
        pdf.setTextColor(80, 80, 80);
        pdf.text(item.label, summaryLabelX, yPosition + 18 + index * 7);

        pdf.setTextColor(0, 0, 0);
        pdf.text(
          formatAmount(item.value),
          summaryValueX,
          yPosition + 18 + index * 7,
          { align: "right" }
        );
      });

      pdf.setFillColor(59, 130, 246);
      pdf.rect(summaryStartX, yPosition + 40, summaryWidth, 12, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("GRAND TOTAL", summaryLabelX, yPosition + 48);

      const grandTotalText = formatAmount(grandTotal);
      pdf.text(grandTotalText, summaryValueX, yPosition + 48, {
        align: "right",
      });

      pdf.setTextColor(0, 0, 0);
      yPosition += 57;
    }
  }

  const timelineSection = enabledSections.find(
    (s) => s.type === "timeline_schedule"
  );
  if (timelineSection) {
    addSectionHeader("PROJECT TIMELINE", sectionNumber++);
    checkPageBreak(30);

    if (timelineSection.data.timelineDetails) {
      addFormattedText(timelineSection.data.timelineDetails, 11, false,margin1);
    }

    if (
      timelineSection.data.milestones &&
      timelineSection.data.milestones.length > 0
    ) {
      checkPageBreak(30);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 130, 246);
      pdf.text("PROJECT MILESTONES", margin1, yPosition);
      pdf.setTextColor(0, 0, 0);

     // yPosition += 10;
       yPosition += 5;
      drawLine(
        margin1,
        yPosition - 2,
        margin1 + 70,
        yPosition - 2,
        [59, 130, 246],
        1
      );
      yPosition += 5;

      addBulletList(timelineSection.data.milestones, 10);
    } else {
      yPosition += 0;
    }

    checkPageBreak(30);
  }

  const termsSection = enabledSections.find(
    (s) => s.type === "terms_warranties"
  );
  if (termsSection) {
    addSectionHeader("TERMS & CONDITIONS", sectionNumber++);
    checkPageBreak(30);

    if (termsSection.data.generalTerms) {
      addFormattedText(termsSection.data.generalTerms, 11, false,margin1);
    }

    if (termsSection.data.terms && termsSection.data.terms.length > 0) {
      checkPageBreak(30);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 130, 246);
      pdf.text("SPECIFIC TERMS & CONDITIONS", margin1, yPosition);
      pdf.setTextColor(0, 0, 0);

      yPosition += 5;
      drawLine(
        margin1,
        yPosition - 2,
        margin1 + 100,
        yPosition - 2,
        [59, 130, 246],
        1
      );
      yPosition += 10;

      addBulletList(termsSection.data.terms, 10);
    } else {
      if (!termsSection.data.generalTerms) {
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(150, 150, 150);
        pdf.text("Standard terms and conditions apply.", margin1, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 0;
      } else {
        yPosition += 5;
      }
    }

    checkPageBreak(30);
  }

  const contactSection = enabledSections.find(
    (s) => s.type === "contact_information"
  );
  if (contactSection) {
    addSectionHeader("CONTACT INFORMATION", sectionNumber++);
    checkPageBreak(20);

    const columnWidth = contentWidth / 2 - 5;
    const leftColumnX = margin1;
    const rightColumnX = margin1 + columnWidth + 10;

    const columnsStartY = yPosition + 5;
    let leftColumnY = columnsStartY;
    let rightColumnY = columnsStartY;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(59, 130, 246);
    pdf.text("CLIENT INFORMATION", leftColumnX, yPosition);
    pdf.setTextColor(0, 0, 0);

    yPosition += 8;
    drawLine(
      leftColumnX,
      yPosition - 2,
      leftColumnX + 60,
      yPosition - 2,
      [255,255,255],
      1
    );
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const clientInfo = contactSection.data.contactInfo || {};
    const clientDetails = [];

    if (clientInfo.clientCompanyName) {
      clientDetails.push(`Company: ${clientInfo.clientCompanyName}`);
    }
    if (clientInfo.clientContactPerson) {
      clientDetails.push(`Contact: ${clientInfo.clientContactPerson}`);
    }
    if (clientInfo.clientEmail) {
      clientDetails.push(`Email: ${clientInfo.clientEmail}`);
    }
    if (clientInfo.clientPhone) {
      clientDetails.push(`Phone: ${clientInfo.clientPhone}`);
    }
    if (clientInfo.clientAddress) {
      clientDetails.push(`Address: ${clientInfo.clientAddress}`);
    }

    clientDetails.forEach((detail, index) => {
      if (detail) {
        pdf.text(detail, leftColumnX, leftColumnY);
        leftColumnY += 6;
      }
    });

    if (clientDetails.length === 0) {
      pdf.setFont("italic");
      pdf.setTextColor(150, 150, 150);
      pdf.text("Client information not provided", leftColumnX, leftColumnY);
      pdf.setFont("normal");
      pdf.setTextColor(0, 0, 0);
      leftColumnY += 6;
    }

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(59, 130, 246);
    pdf.text("COMPANY INFORMATION", rightColumnX, yPosition -18);
    pdf.setTextColor(0, 0, 0);

    drawLine(
      rightColumnX,
      yPosition - 10,
      rightColumnX + 70,
      yPosition - 10,
      [255,255,255],
      1
    );

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const companyDetails = [];

    if (clientInfo.companyName) {
      companyDetails.push(`Company: ${clientInfo.companyName}`);
    } else {
      companyDetails.push("Company: SBR Technologies");
    }
    if (clientInfo.companyContactPerson) {
      companyDetails.push(`Contact: ${clientInfo.companyContactPerson}`);
    } else {
      companyDetails.push("Contact: Bilal");
    }
    if (clientInfo.companyEmail) {
      companyDetails.push(`Email: ${clientInfo.companyEmail}`);
    }
    if (clientInfo.companyPhone) {
      companyDetails.push(`Phone: ${clientInfo.companyPhone}`);
    }
    if (clientInfo.companyAddress) {
      companyDetails.push(`Address: ${clientInfo.companyAddress}`);
    }

    companyDetails.forEach((detail, index) => {
      if (detail) {
        pdf.text(detail, rightColumnX, rightColumnY);
        rightColumnY += 6;
      }
    });

    yPosition = Math.max(leftColumnY, rightColumnY) + 15;

    if (
      contactSection.data.nextSteps &&
      contactSection.data.nextSteps.length > 0
    ) {
      checkPageBreak(30);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 130, 246);
      pdf.text("NEXT STEPS & ACTION ITEMS", margin1, yPosition);
      pdf.setTextColor(0, 0, 0);

      yPosition += 8;
      drawLine(
        margin1,
        yPosition - 2,
        margin1 + 90,
        yPosition - 2,
        [59, 130, 246],
        1
      );
      yPosition += 2;

      addBulletList(contactSection.data.nextSteps, 10);
    }

    checkPageBreak(30);
  }

  checkPageBreak(35);

  const footerY = 230;
  addText("Bank Details", margin + 5, footerY + 5, 10, true);
  pdf.setFontSize(9);
  pdf.text("ADCB Bank", margin + 5, footerY + 10);
  pdf.text("IBAN (AED): AE090030013047666920001", margin + 5, footerY + 14);
  pdf.text("A/C: 13047666920001", margin + 5, footerY + 18);

  pdf.setDrawColor(150, 150, 150);
  pdf.setLineWidth(1);
  pdf.line(
    margin + contentWidth / 2 + 30,
    footerY + 12,
    margin + contentWidth / 2 + contentWidth / 2 - 15,
    footerY + 12
  );

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    "Bilal",
    margin + contentWidth / 2 + contentWidth / 4,
    footerY + 16,
    { align: "center" }
  );

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "Technical Manager",
    margin + contentWidth / 2 + contentWidth / 4,
    footerY + 20,
    { align: "center" }
  );

  yPosition = footerY + 25;

  // Add footer to every page
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addHeaderToEveryPage();
    addFooterToEveryPage(); // NEW 2-row footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
    pdf.setTextColor(0, 0, 0);
  }

  return pdf;
};
//pdf

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
        letterContent: `We are pleased to submit this comprehensive proposal for your consideration. 
Our team has carefully analyzed your requirements and developed a tailored solution that meets your specific needs.`,
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
        summary: `This proposal presents a comprehensive solution tailored to meet your specific business requirements.
 Our experienced team brings deep industry knowledge and proven methodologies to deliver exceptional results.`,
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
        approach: `Our solution approach is based on industry best practices and proven methodologies.
  We follow a structured implementation process that ensures quality, minimizes risks, and maximizes value delivery.`,
        solutionOverview: `We propose a comprehensive solution that addresses all identified challenges throughts

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
          <span className="text-sm text-gray-500 font-semibold">
            (5 templates)
          </span>
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

  const [isCoverLetterVisible, setIsCoverLetterVisible] = useState(true);

  const renderCoverPage = (section: QuotationSection) => {
    // Auto-resize function for letter content
    const handleLetterContentInput = (
      e: React.FormEvent<HTMLTextAreaElement>
    ) => {
      const textarea = e.currentTarget;
      textarea.style.height = "5px"; // Minimum height for one line
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    };

    return (
      <div className="space-y-1">
        {/* Cover Letter Header with Toggle Button */}
        <div className="flex items-center justify-between -mb-2">
          <h2 className="font-semibold text-lg -mt-7">Cover Letter</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsCoverLetterVisible(!isCoverLetterVisible)}
            className="h-[2px] px-1 text-xs -mt-10 text-gray-500 hover:text-gray-700"
          >
            {isCoverLetterVisible ? "Hide ▲" : "Show ▼"}
          </Button>
        </div>

        {/* Section Content - Conditionally Rendered */}
        {isCoverLetterVisible ? (
          <div className="space-y-1">
            <div className="space-y-1">
              <div className="space-y-1">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={section.data.subject}
                  onChange={(e) =>
                    updateSectionData(section.id, { subject: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 -mb-5">
                <Label htmlFor="letterContent">Letter Content</Label>
                <Textarea
                  id="letterContent"
                  value={section.data.letterContent}
                  onChange={(e) =>
                    updateSectionData(section.id, {
                      letterContent: e.target.value,
                    })
                  }
                  onInput={handleLetterContentInput}
                  className="resize-none overflow-hidden min-h-[5px]"
                  placeholder="Enter your cover letter content..."
                  style={{ minHeight: "5px", maxHeight: "800px" }}
                />
              </div>
            </div>
          </div>
        ) : (
          // Hidden State
          <div className="h-[1px]"></div>
        )}
      </div>
    );
  };

  const [isExecutiveSummaryVisible, setIsExecutiveSummaryVisible] =
    useState(true);

  const renderExecutiveSummary = (section: QuotationSection) => {
    // Auto-resize for executive summary
    const handleSummaryInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      textarea.style.height = "5px";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    return (
      <div className="space-y-1">
        {/* Executive Summary Header with Toggle Button */}
        <div className="flex justify-end -mb-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setIsExecutiveSummaryVisible(!isExecutiveSummaryVisible)
            }
            className="h-[2px] px-1 text-xs -mt-10 text-gray-500 hover:text-gray-700"
          >
            {isExecutiveSummaryVisible ? "Hide ▲" : "Show ▼"}
          </Button>
        </div>

        {/* Section Content - Conditionally Rendered */}
        {isExecutiveSummaryVisible ? (
          <>
            <div className="space-y-1 -mt-5">
              <Label htmlFor="summary">Executive Summary</Label>
              <Textarea
                id="summary"
                value={section.data.summary}
                onChange={(e) =>
                  updateSectionData(section.id, { summary: e.target.value })
                }
                onInput={handleSummaryInput}
                className="resize-none overflow-hidden min-h-[5px] text-lg leading-relaxed"
                placeholder="Enter executive summary..."
                style={{ minHeight: "5px", maxHeight: "800px" }}
              />
            </div>

            <div className="space-y-1 -mb-4 -mt-0 ">
              <div className="flex items-center justify-between">
                <Label>Key Benefits</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newBenefits = [...section.data.keyBenefits, ""];
                      updateSectionData(section.id, {
                        keyBenefits: newBenefits,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {section.data.keyBenefits.map(
                  (benefit: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        value={benefit}
                        onChange={(e) => {
                          const newBenefits = [...section.data.keyBenefits];
                          newBenefits[index] = e.target.value;
                          updateSectionData(section.id, {
                            keyBenefits: newBenefits,
                          });
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
                            updateSectionData(section.id, {
                              keyBenefits: newBenefits,
                            });
                          }}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500 bg-white" />
                        </Button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        ) : (
          // Hidden State
          <div className="h-[1px]"></div>
        )}
      </div>
    );
  };

  const [isSectionVisible, setIsSectionVisible] = useState(true);

  const renderCompanyIntroduction = (section: QuotationSection) => {
    // Auto-resize function
    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      textarea.style.height = "5px"; // Reset to minimum
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    };

    // Handle text change
    const handleTextareaChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      updateSectionData(section.id, { description: e.target.value });
    };

    return (
      <div className="space-y-1">
        {/* Small Toggle Button - TOP RIGHT CORNER */}
        <div className="flex justify-end -mb-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsSectionVisible(!isSectionVisible)}
            className="h-[2px] px-1 text-xs -mt-10 text-gray-500 hover:text-gray-700"
          >
            {isSectionVisible ? "Hide ▲" : "Show ▼"}
          </Button>
        </div>

        {/* Section Content - Conditionally Rendered */}
        {isSectionVisible ? (
          <>
            <div className="space-y-1 -mt-5">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={section.data.description}
                onChange={handleTextareaChange}
                onInput={handleTextareaInput}
                className="resize-none overflow-hidden"
                placeholder="Enter company description..."
                style={{
                  minHeight: "5px", // Changed from 20px to 5px
                  maxHeight: "400px",
                  height: "auto",
                }}
              />
            </div>

            <div className="space-y-1 -mb-4 ">
              <div className="flex items-center justify-between">
                <Label>Achievements</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    // className="-mt-10"
                    size="sm"
                    onClick={() => {
                      const newAchievements = [
                        ...section.data.achievements,
                        "",
                      ];
                      updateSectionData(section.id, {
                        achievements: newAchievements,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4" />
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
                          const newAchievements = [
                            ...section.data.achievements,
                          ];
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
                            const newAchievements =
                              section.data.achievements.filter(
                                (_: string, i: number) => i !== index
                              );
                            updateSectionData(section.id, {
                              achievements: newAchievements,
                            });
                          }}
                          className=" flex-shrink-0 bg-red"
                        >
                          <Trash2 className="h-4 w-4 text-red-500 bg-white" />
                        </Button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        ) : (
          // Hidden State - Sirf "Company Introduction" text
          <div className=" h-1"></div>
        )}
      </div>
    );
  };

  const [isProblemStatementVisible, setIsProblemStatementVisible] =
    useState(true);

  const renderProblemStatement = (section: QuotationSection) => {
    // Auto-resize for current situation textarea
    const handleCurrentSituationInput = (
      e: React.FormEvent<HTMLTextAreaElement>
    ) => {
      const textarea = e.currentTarget;
      textarea.style.height = "5px";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    return (
      <div className="space-y-1">
        {/* Problem Statement Header with Toggle Button */}
        <div className="flex justify-end -mb-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setIsProblemStatementVisible(!isProblemStatementVisible)
            }
            className="h-[2px] px-1 text-xs -mt-10 text-gray-500 hover:text-gray-700"
          >
            {isProblemStatementVisible ? "Hide ▲" : "Show ▼"}
          </Button>
        </div>

        {/* Section Content - Conditionally Rendered */}
        {isProblemStatementVisible ? (
          <div className="space-y-1">
            <div className="space-y-1 -mt-5">
              <Label htmlFor="currentSituation">
                Current Situation Analysis
              </Label>
              <Textarea
                id="currentSituation"
                value={section.data.currentSituation}
                onChange={(e) =>
                  updateSectionData(section.id, {
                    currentSituation: e.target.value,
                  })
                }
                onInput={handleCurrentSituationInput}
                className="resize-none overflow-hidden min-h-[5px]"
                placeholder="Enter current situation analysis..."
                style={{ minHeight: "5px", maxHeight: "800px" }}
              />
            </div>

            <div className="space-y-1 -mb-4">
              <div className="flex items-center justify-between">
                <Label>Project Objectives</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newObjectives = [...section.data.objectives, ""];
                      updateSectionData(section.id, {
                        objectives: newObjectives,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {section.data.objectives.map(
                  (objective: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        value={objective}
                        onChange={(e) => {
                          const newObjectives = [...section.data.objectives];
                          newObjectives[index] = e.target.value;
                          updateSectionData(section.id, {
                            objectives: newObjectives,
                          });
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
                            const newObjectives =
                              section.data.objectives.filter(
                                (_: any, i: number) => i !== index
                              );
                            updateSectionData(section.id, {
                              objectives: newObjectives,
                            });
                          }}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500 bg-white" />
                        </Button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          // Hidden State
          <div className="h-[1px]"></div>
        )}
      </div>
    );
  };

  const [isSolutionDetailsVisible, setIsSolutionDetailsVisible] =
    useState(true);

  const renderSolutionDetails = (section: QuotationSection) => {
    // Auto-resize for approach textarea
    const handleApproachInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      textarea.style.height = "5px";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    return (
      <div className="space-y-1">
        {/* Solution Details Header with Toggle Button */}
        <div className="flex justify-end -mb-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setIsSolutionDetailsVisible(!isSolutionDetailsVisible)
            }
            className="h-[2px] px-1 text-xs -mt-10 text-gray-500 hover:text-gray-700"
          >
            {isSolutionDetailsVisible ? "Hide ▲" : "Show ▼"}
          </Button>
        </div>

        {/* Section Content - Conditionally Rendered */}
        {isSolutionDetailsVisible ? (
          <div className="space-y-1">
            <div className="space-y-1 -mt-5">
              <Label htmlFor="approach">Our Approach</Label>
              <Textarea
                id="approach"
                value={section.data.approach}
                onChange={(e) =>
                  updateSectionData(section.id, { approach: e.target.value })
                }
                onInput={handleApproachInput}
                className="resize-none overflow-hidden min-h-[5px]"
                placeholder="Enter our approach details..."
                style={{ minHeight: "5px", maxHeight: "800px" }}
              />
            </div>

            <div className="space-y-1 -mb-4 -mt-1">
              <div className="flex items-center justify-between">
                <Label>Key Features</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newFeatures = [...section.data.keyFeatures, ""];
                      updateSectionData(section.id, {
                        keyFeatures: newFeatures,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {section.data.keyFeatures.map(
                  (feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...section.data.keyFeatures];
                          newFeatures[index] = e.target.value;
                          updateSectionData(section.id, {
                            keyFeatures: newFeatures,
                          });
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
                            updateSectionData(section.id, {
                              keyFeatures: newFeatures,
                            });
                          }}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500 bg-white" />
                        </Button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          // Hidden State
          <div className="h-[1px]"></div>
        )}
      </div>
    );
  };

  // AutoResizeTextarea Component
  const AutoResizeTextarea = ({
    value,
    onChange,
    placeholder,
    className = "",
    rows = 1,
  }: any) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [value]);

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden ${className}`}
      />
    );
  };

  // Main agreement form function
  const renderProductSpecifications = (section: QuotationSection) => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">
            Service Agreement
          </h3>
          <p className="text-muted-foreground">
            Define terms, conditions, and signatures for the agreement
          </p>
        </div>
      </div>

      {/* Signatures Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Signature Card */}
        <Card className="border-green-100 hover:border-green-300 transition-colors">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg font-semibold">
                  Company Signature
                </CardTitle>
              </div>
              <Badge
                variant={section.data.companySignature ? "default" : "outline"}
                className={
                  section.data.companySignature
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : ""
                }
              >
                {section.data.companySignature ? "Signed" : "Pending"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Company Name</Label>
                <Input
                  value={section.data.companyName || ""}
                  onChange={(e) =>
                    updateSectionData(section.id, {
                      companyName: e.target.value,
                    })
                  }
                  placeholder="Enter authorized representative name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Designation</Label>
                <Input
                  value={section.data.companyDesignation || ""}
                  onChange={(e) =>
                    updateSectionData(section.id, {
                      companyDesignation: e.target.value,
                    })
                  }
                  placeholder="e.g., CEO, Director, Manager"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Upload Digital Signature
              </Label>
              <div
                className=" cursor-pointer"
                onClick={() =>
                  document.getElementById("company-signature-upload")?.click()
                }
              >
                {section.data.companySignature ? (
                  <div className="space-y-2">
                    <div className="relative w-32 h-16 mx-auto border rounded bg-white">
                      <img
                        src={section.data.companySignature}
                        alt="Company Signature"
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <p className="text-xs text-green-600">
                      Signature uploaded ✓
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-green-400" />
                    <p className="text-sm text-gray-600">
                      Click to upload signature
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                  </div>
                )}
                <input
                  type="file"
                  id="company-signature-upload"
                  className="hidden"
                  accept=".png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert("File size should be less than 2MB");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updateSectionData(section.id, {
                          companySignature: reader.result as string,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>

            {section.data.companySignature && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateSectionData(section.id, {
                    companySignature: null,
                  })
                }
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Signature
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Client Signature Card - BLANK VERSION */}
        <Card className="border-blue-100">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-semibold">
                  Client Signature
                </CardTitle>
              </div>
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                For Manual Signing
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Client Name</Label>
                <Input
                  value={section.data.clientName || ""}
                  onChange={(e) =>
                    updateSectionData(section.id, {
                      clientName: e.target.value,
                    })
                  }
                  placeholder="Enter client full name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Designation</Label>
                <Input
                  value={section.data.clientOrganization || ""}
                  onChange={(e) =>
                    updateSectionData(section.id, {
                      clientOrganization: e.target.value,
                    })
                  }
                  placeholder="Client's company or organization"
                  className="mt-1"
                />
              </div>
            </div>

            {/* BLANK SIGNATURE SPACE */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Signature Space</Label>

              <div className="space-y-6">
                {/* Signature line */}

                <p className="text-sm text-gray-700 mt-10">
                  _______________________
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agreement Details & Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agreement Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Agreement Date</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={section.data.agreementDate || ""}
                  onChange={(e) =>
                    updateSectionData(section.id, {
                      agreementDate: e.target.value,
                    })
                  }
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    updateSectionData(section.id, {
                      agreementDate: today,
                    });
                  }}
                >
                  Today
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Agreement ID</Label>
              <Input
                value={
                  section.data.agreementId ||
                  `AGR-${Date.now().toString().slice(-6)}`
                }
                onChange={(e) =>
                  updateSectionData(section.id, {
                    agreementId: e.target.value,
                  })
                }
                placeholder="Auto-generated"
              />
            </div>

            <div className="space-y-2">
              <Label>Validity Period (Days)</Label>
              <Select
                value={section.data.validityPeriod || "30"}
                onValueChange={(value) =>
                  updateSectionData(section.id, {
                    validityPeriod: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select validity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="15">15 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* General Notes with auto-resize */}
          <div className="mt-4 space-y-2">
            <Label>General Notes & Remarks</Label>
            <textarea
              value={section.data.generalNotes || ""}
              onChange={(e) =>
                updateSectionData(section.id, {
                  generalNotes: e.target.value,
                })
              }
              placeholder="Add any additional notes or remarks for this agreement..."
              className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden min-h-[48px]"
              rows={2}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Signature Preview */}
    </div>
  );

  //quotation item

  // States
  const [columnDropdownOpen, setColumnDropdownOpen] = useState<string | null>(
    null
  );
  const [showServicesSection, setShowServicesSection] = useState<{
    [key: string]: boolean;
  }>({});
  const [isTextareaMode, setIsTextareaMode] = useState(true);
  const [textareaHeights, setTextareaHeights] = useState<{
    [key: string]: number;
  }>({});

  // NEW STATE FOR DIRECT PRODUCT NAME INPUT
  const [isEditingProductName, setIsEditingProductName] = useState<
    string | null
  >(null);
  const [tempProductName, setTempProductName] = useState("");

  // NEW STATE FOR IMAGE GALLERY FOR CUSTOM PRODUCTS
  const [showImageGallery, setShowImageGallery] = useState<string | null>(null);

  // Function to toggle services section visibility
  const toggleServicesSection = (itemId: string) => {
    setShowServicesSection((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Function to handle textarea height change
  const handleTextareaHeightChange = (itemId: string, height: number) => {
    setTextareaHeights((prev) => ({
      ...prev,
      [itemId]: height,
    }));
  };

  // Function to handle image upload for custom product
  const handleCustomProductImageUpload = (itemId: string, imageUrl: string) => {
    updateQuotationItem(itemId, {
      images: [imageUrl],
    });
    setShowImageGallery(null);
  };

  // Function to remove custom product image
  const removeCustomProductImage = (itemId: string) => {
    updateQuotationItem(itemId, {
      images: [],
    });
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

          // REMOVED AUTOMATIC SHOWING OF SERVICES SECTION
          // Services will only show when user clicks + icon
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
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

      // Directly update sections state
      const updatedSections = sections.map((sec) => {
        if (sec.type === "quotation_items") {
          return {
            ...sec,
            data: {
              ...sec.data,
              items: [...sec.data.items, newItem],
            },
          };
        }
        return sec;
      });

      setSections(updatedSections);
    };

    // SIMPLE WORKING: Update function for quotation items
    const updateQuotationItem = (
      itemId: string,
      data: Partial<QuotationItem>
    ) => {
      // Directly update sections state
      const updatedSections = sections.map((sec) => {
        if (sec.type === "quotation_items") {
          const updatedItems = sec.data.items.map((item: QuotationItem) => {
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
          });

          return {
            ...sec,
            data: {
              ...sec.data,
              items: updatedItems,
            },
          };
        }
        return sec;
      });

      setSections(updatedSections);
    };

    // NEW: SINGLE UNIFIED UPDATE FUNCTION FOR ALL CHANGES
    const updateQuotationItemUniversal = async (
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

      // Special handling for product changes
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
            .filter((item: QuotationItem) => item.id !== itemId && item.id !== existingItem.id)
            .concat([mergedItem]);

          const updatedSections = sections.map((sec) => {
            if (sec.type === "quotation_items") {
              return {
                ...sec,
                data: { ...sec.data, items: updatedItems },
              };
            }
            return sec;
          });

          setSections(updatedSections);

          // Clean up for deleted item
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

        // Hide services section
        setShowServicesSection((prev) => ({
          ...prev,
          [itemId]: false,
        }));

        // Product change auto-fill logic
        const product = products.find((p) => p.id === data.productId);
        if (product) {
          const updateData = {
            productId: data.productId,
            productName: product.name,
            sku: product.sku || currentItem.sku,
            rate: product.sellingPrice,
            images: product.images || [],
            description: "",
          };

          // Smart description handling
          const currentDescription = currentItem.description || "";
          const productDescription = product.description || "";

          if (!currentDescription.trim()) {
            // Case 1: Empty - use product description
            updateData.description = productDescription;
          } else {
            // Case 2: User has text - append product description
            // Check if product description is already present
            if (currentDescription.includes(productDescription)) {
              // Already contains product description
              updateData.description = currentDescription;
            } else {
              // Append product description
              updateData.description = `${currentDescription}\n\n${productDescription}`;
            }
          }

          // Update with the combined data
          updateQuotationItem(itemId, { ...updateData, ...data });
          return;
        }
      }

      // For description changes - direct update
      if (data.description !== undefined) {
        updateQuotationItem(itemId, data);
        return;
      }

      // For all other changes
      updateQuotationItem(itemId, data);
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

    // Remove quotation item completely
    const removeQuotationItem = (itemId: string) => {
      const updatedSections = sections.map((sec) => {
        if (sec.type === "quotation_items") {
          const updatedItems = sec.data.items.filter(
            (item: QuotationItem) => item.id !== itemId
          );
          return {
            ...sec,
            data: { ...sec.data, items: updatedItems },
          };
        }
        return sec;
      });

      setSections(updatedSections);
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

      // Clean up for all items under this title
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

          // Also hide services section for these items
          setShowServicesSection((prev) => {
            const newState = { ...prev };
            delete newState[item.id];
            return newState;
          });
        });

      const updatedSections = sections.map((sec) => {
        if (sec.type === "quotation_items") {
          return {
            ...sec,
            data: {
              ...sec.data,
              titles: updatedTitles,
              items: updatedItems,
            },
          };
        }
        return sec;
      });

      setSections(updatedSections);
    };

    // Delete individual field value
    const deleteFieldValue = (
      itemId: string,
      fieldName: keyof QuotationItem,
      defaultValue: any = ""
    ) => {
      const updatedSections = sections.map((sec) => {
        if (sec.type === "quotation_items") {
          const updatedItems = sec.data.items.map((item: QuotationItem) => {
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
          });

          return {
            ...sec,
            data: { ...sec.data, items: updatedItems },
          };
        }
        return sec;
      });

      setSections(updatedSections);
    };

    // Delete product from item
    const deleteProductFromItem = (itemId: string) => {
      const updatedSections = sections.map((sec) => {
        if (sec.type === "quotation_items") {
          const updatedItems = sec.data.items.map((item: QuotationItem) => {
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
          });

          return {
            ...sec,
            data: { ...sec.data, items: updatedItems },
          };
        }
        return sec;
      });

      setSections(updatedSections);

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

      // Hide services section when product is removed
      setShowServicesSection((prev) => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    };

    // Delete SKU from item
    const deleteSkuFromItem = (itemId: string) => {
      const updatedSections = sections.map((sec) => {
        if (sec.type === "quotation_items") {
          const updatedItems = sec.data.items.map((item: QuotationItem) => {
            if (item.id === itemId) {
              return {
                ...item,
                sku: "",
              };
            }
            return item;
          });

          return {
            ...sec,
            data: { ...sec.data, items: updatedItems },
          };
        }
        return sec;
      });

      setSections(updatedSections);
    };

    // Delete images from item
    const deleteImagesFromItem = (itemId: string) => {
      const updatedSections = sections.map((sec) => {
        if (sec.type === "quotation_items") {
          const updatedItems = sec.data.items.map((item: QuotationItem) => {
            if (item.id === itemId) {
              return {
                ...item,
                images: [],
              };
            }
            return item;
          });

          return {
            ...sec,
            data: { ...sec.data, items: updatedItems },
          };
        }
        return sec;
      });

      setSections(updatedSections);
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
        // Clean up for this item
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

        // Hide services section for this item
        setShowServicesSection((prev) => {
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
    const getVisibleColumns = (item: QuotationItem) => {
      const columns = [];

      // Add columns based on visibility - SEPARATE checks
      if (item.printVisibility?.itemId !== false) columns.push("itemId");
      if (item.printVisibility?.sku !== false) columns.push("sku");
      if (item.printVisibility?.productName !== false)
        columns.push("productName");
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
      const updatedSections = sections.map((sec) => {
        if (sec.type === "quotation_items") {
          const updatedItems = sec.data.items.map((item: QuotationItem) => {
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
          });

          return {
            ...sec,
            data: { ...sec.data, items: updatedItems },
          };
        }
        return sec;
      });

      setSections(updatedSections);
    };

    return (
      <div className="space-y-8">
        {/* SIMPLE FILE INPUT FOR SELECTING ANY IMAGE FROM DEVICE */}
        {showImageGallery && (
          <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="text-center py-8">
                <div className="space-y-4">
                  <label className="block">
                    <div className="border-2 border-dashed border-blue-400 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                      <p className="text-lg font-medium text-blue-600 mb-2">
                        Browse Files
                      </p>
                      <p className="text-gray-600 text-sm">
                        Click to select image from your device
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Create a local URL for the selected image
                            const imageUrl = URL.createObjectURL(file);
                            handleCustomProductImageUpload(
                              showImageGallery,
                              imageUrl
                            );
                          }
                        }}
                      />
                    </div>
                  </label>

                  <div className="text-sm text-gray-500 text-center">
                    <p>Supported formats: JPG, PNG, GIF, WebP</p>
                    <p>Max size: 5MB</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowImageGallery(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

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
              key={`title-${title.id}-${titleIndex}`}
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
                      {visibleColumns.includes("itemId") &&
                        visibleColumns.includes("productName") && (
                          <div className="flex items-center gap-24 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-10">
                              <span className="text-sm font-semibold text-gray-700">
                                Number
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-semibold text-gray-700">
                                Product Name
                              </span>
                            </div>
                          </div>
                        )}

                      {/* Part No Header */}
                      {visibleColumns.includes("sku") && (
                        <div className="flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-700 text-center w-[110px] block">
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
                                  checked={
                                    sampleItem?.printVisibility?.itemId !==
                                    false
                                  }
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
                                  checked={
                                    sampleItem?.printVisibility?.productName !==
                                    false
                                  }
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
                                  checked={
                                    sampleItem?.printVisibility?.sku !== false
                                  }
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
                                  checked={
                                    sampleItem?.printVisibility?.quantity !==
                                    false
                                  }
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
                                  checked={
                                    sampleItem?.printVisibility?.rate !== false
                                  }
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
                                  checked={
                                    sampleItem?.printVisibility?.tax !== false
                                  }
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
                                  checked={
                                    sampleItem?.printVisibility?.discount !==
                                    false
                                  }
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
                                  checked={
                                    sampleItem?.printVisibility?.amount !==
                                    false
                                  }
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
                      const itemVisibleColumns = visibleColumns;
                      const isServicesVisible =
                        showServicesSection[item.id] || false;
                      const textareaHeight = textareaHeights[item.id] || 65;

                      return (
                        <div
                          key={`item-${item.id}-${index}-${Date.now()}`}
                          className="border rounded-lg p-3 bg-white shadow-sm mb-3"
                        >
                          {/* Main Row - All in one line - NO IMAGE HERE */}
                          <div className="flex items-center gap-2 mb-2">
                            {/* Number - Only show if in visibleColumns */}
                            {itemVisibleColumns.includes("itemId") && (
                              <div className="flex-shrink-0 w-10">
                                <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 border border-gray-300 font-medium text-gray-700 text-sm">
                                  {item.itemId ||
                                    generateItemId(titleIndex, index)}
                                </div>
                              </div>
                            )}

                            {/* Empty space where image was - IMAGE IS NOW IN DESCRIPTION ROW */}
                            <div className="flex-shrink-0 w-[70px]"></div>

                            {/* Product Dropdown - Only show if in visibleColumns */}
                            {itemVisibleColumns.includes("productName") && (
                              <div className="flex-1 min-w-0">
                                <div className="relative">
                                  {/* SHOW INPUT FIELD WHEN EDITING PRODUCT NAME (FOR CUSTOM PRODUCTS) */}
                                  {isEditingProductName === item.id ? (
                                    <div className="relative">
                                      <Input
                                        value={tempProductName}
                                        onChange={(e) =>
                                          setTempProductName(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            updateQuotationItemUniversal(
                                              item.id,
                                              {
                                                productName: tempProductName,
                                              }
                                            );
                                            setIsEditingProductName(null);
                                          }
                                          if (e.key === "Escape") {
                                            setIsEditingProductName(null);
                                            setTempProductName("");
                                          }
                                        }}
                                        onBlur={() => {
                                          if (tempProductName.trim()) {
                                            updateQuotationItemUniversal(
                                              item.id,
                                              {
                                                productName: tempProductName,
                                              }
                                            );
                                          }
                                          setIsEditingProductName(null);
                                        }}
                                        placeholder="Enter product name"
                                        className="w-full h-8 px-2 border-gray-300"
                                        autoFocus
                                      />
                                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                        Press Enter to save
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      className="w-full h-8 px-2 border border-gray-300 rounded flex items-center justify-between cursor-pointer hover:bg-gray-50"
                                      onClick={() => {
                                        if (
                                          item.productId?.startsWith(
                                            "custom_"
                                          ) ||
                                          !item.productId
                                        ) {
                                          setTempProductName(
                                            item.productName || ""
                                          );
                                          setIsEditingProductName(item.id);
                                        }
                                      }}
                                    >
                                      <span
                                        className={`text-sm truncate ${
                                          !item.productId
                                            ? "text-gray-500"
                                            : item.productId.startsWith(
                                                "custom_"
                                              )
                                            ? "text-blue-600"
                                            : ""
                                        }`}
                                      >
                                        {item.productId ? (
                                          item.productId.startsWith(
                                            "custom_"
                                          ) ? (
                                            <div className="flex items-center justify-between w-full">
                                              <span className="truncate">
                                                {item.productName ||
                                                  "Custom Product"}
                                              </span>
                                              <span className="text-xs text-blue-500 ml-2">
                                                (Custom - Click to edit)
                                              </span>
                                            </div>
                                          ) : (
                                            (() => {
                                              const selectedProduct =
                                                products.find(
                                                  (p) => p.id === item.productId
                                                );
                                              return selectedProduct ? (
                                                <span className="truncate">
                                                  {selectedProduct.name}
                                                </span>
                                              ) : (
                                                <span className="text-gray-500">
                                                  Select Product
                                                </span>
                                              );
                                            })()
                                          )
                                        ) : (
                                          <span className="text-gray-500">
                                            Select Product
                                          </span>
                                        )}
                                      </span>
                                      <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
                                    </div>
                                  )}

                                  {/* DROPDOWN FOR SELECTING PRODUCTS */}
                                  <Select
                                    value={item.productId}
                                    onValueChange={async (value) => {
                                      if (value === "custom_product") {
                                        // Custom product selected
                                        const customProductId = `custom_${Date.now()}_${Math.random()
                                          .toString(36)
                                          .substr(2, 9)}`;

                                        // Set as custom product
                                        await updateQuotationItemUniversal(
                                          item.id,
                                          {
                                            productId: customProductId,
                                            productName: "", // Empty so user can type
                                            sku: "",
                                            description: "",
                                            rate: 0,
                                            images: [],
                                          }
                                        );

                                        // Automatically open the input field for typing
                                        setTempProductName("");
                                        setIsEditingProductName(item.id);

                                        // Hide services section for custom product
                                        setShowServicesSection((prev) => ({
                                          ...prev,
                                          [item.id]: false,
                                        }));
                                      } else {
                                        const product = products.find(
                                          (p) => p.id === value
                                        );
                                        if (product) {
                                          await updateQuotationItemUniversal(
                                            item.id,
                                            {
                                              productId: value,
                                              productName: product.name,
                                              sku:
                                                product.sku || item.sku || "",
                                              rate: product.sellingPrice,
                                              images: product.images || [],
                                            }
                                          );

                                          // Fetch services but DON'T show them automatically
                                          await fetchProductServices(value);
                                          // Keep services section hidden by default
                                          setShowServicesSection((prev) => ({
                                            ...prev,
                                            [item.id]: false,
                                          }));
                                        }
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="absolute inset-0 opacity-0 cursor-pointer">
                                      <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent className="min-w-[300px] max-h-[350px] overflow-y-auto">
                                      {/* EXISTING PRODUCTS */}
                                      {products.map((p, productIndex) => (
                                        <SelectItem
                                          key={`product-${p.id}-${productIndex}-${titleIndex}`}
                                          value={p.id}
                                          className="py-1.5"
                                        >
                                          <div className="flex items-center gap-2">
                                            {p.images &&
                                              p.images.length > 0 && (
                                                <img
                                                  src={p.images[0]}
                                                  alt={p.name}
                                                  className="w-8 h-8 object-cover rounded border"
                                                />
                                              )}
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm truncate">
                                                  {p.name}
                                                </span>
                                                <span className="text-xs text-green-600 font-semibold ml-2">
                                                  {formatAmount(p.sellingPrice)}
                                                </span>
                                              </div>
                                              {p.sku && (
                                                <div className="text-xs text-gray-500 truncate">
                                                  {p.sku}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </SelectItem>
                                      ))}

                                      {/* CUSTOM PRODUCT OPTION */}
                                      <SelectItem
                                        value="custom_product"
                                        className="py-1.5 border-t border-gray-200 mt-1"
                                        key={`custom-product-${titleIndex}-${Date.now()}`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <Plus className="h-4 w-4" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <span className="text-sm font-medium text-blue-600">
                                                Add Custom Product
                                              </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Click to type product name
                                              directly
                                            </div>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}

                            {/* Part No Input - Only show if in visibleColumns */}
                            {itemVisibleColumns.includes("sku") && (
                              <div className="flex-shrink-0">
                                <Input
                                  value={item.sku || ""}
                                  onChange={(e) =>
                                    updateQuotationItemUniversal(item.id, {
                                      sku: e.target.value,
                                    })
                                  }
                                  placeholder="Part No"
                                  className="text-sm border-gray-300 text-center w-[119px] h-8 px-1"
                                />
                              </div>
                            )}

                            {/* Qty Input - Only show if in visibleColumns */}
                            {itemVisibleColumns.includes("quantity") && (
                              <div className="flex-shrink-0">
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuotationItemUniversal(item.id, {
                                      quantity: +e.target.value,
                                    })
                                  }
                                  className="text-center w-[50px] h-8 px-1"
                                  min="1"
                                />
                              </div>
                            )}

                            {/* Rate Input - Only show if in visibleColumns */}
                            {itemVisibleColumns.includes("rate") && (
                              <div className="flex-shrink-0">
                                <Input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) =>
                                    updateQuotationItemUniversal(item.id, {
                                      rate: +e.target.value,
                                    })
                                  }
                                  className="text-center w-[60px] h-8 px-1"
                                  min="0"
                                />
                              </div>
                            )}

                            {/* Tax % Input - Only show if in visibleColumns */}
                            {itemVisibleColumns.includes("tax") && (
                              <div className="flex-shrink-0">
                                <Input
                                  type="number"
                                  value={item.tax}
                                  onChange={(e) =>
                                    updateQuotationItemUniversal(item.id, {
                                      tax: +e.target.value,
                                    })
                                  }
                                  className="text-center w-[50px] h-8 px-1"
                                  min="0"
                                  max="100"
                                />
                              </div>
                            )}

                            {/* Disc % Input - Only show if in visibleColumns */}
                            {itemVisibleColumns.includes("discount") && (
                              <div className="flex-shrink-0">
                                <Input
                                  type="number"
                                  value={item.discount}
                                  onChange={(e) =>
                                    updateQuotationItemUniversal(item.id, {
                                      discount: +e.target.value,
                                      discountType: "percentage",
                                    })
                                  }
                                  className="text-center w-[50px] h-8 px-1"
                                  min="0"
                                  max="100"
                                />
                              </div>
                            )}

                            {/* Total Amount - Only show if in visibleColumns */}
                            {itemVisibleColumns.includes("amount") && (
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
                            )}
                          </div>

                          {/* Description Row - IMAGE + TEXTAREA + SERVICES SECTION BESIDE TEXTAREA */}
                          <div className="flex items-start mt-1">
                            {/* Space for number column */}
                            <div className="w-10 flex-shrink-0"></div>

                            {/* Product Image Section - WITH GALLERY OPTION FOR CUSTOM PRODUCTS */}
                            <div
                              className="flex-shrink-0 mr-2 transition-all duration-200 ease-in-out"
                              style={{
                                marginTop: `${Math.max(
                                  0,
                                  (textareaHeight - 65) / 2
                                )}px`,
                              }}
                            >
                              {item.productId ? (
                                (() => {
                                  // Check if it's a custom product
                                  if (item.productId.startsWith("custom_")) {
                                    // CUSTOM PRODUCT - Show gallery option
                                    if (item.images && item.images.length > 0) {
                                      // Custom product with image
                                      return (
                                        <div className="relative w-[80px] h-[106px] bg-white rounded border border-blue-800 overflow-hidden -mt-10 group">
                                          <div className="absolute inset-0 flex items-center justify-center p-1">
                                            <img
                                              src={item.images[0]}
                                              alt={
                                                item.productName ||
                                                "Custom Product"
                                              }
                                              className="max-w-full max-h-full w-auto h-auto"
                                              style={{
                                                objectFit: "contain",
                                                width: "80px",
                                                height: "106px",
                                                maxWidth: "106px",
                                                maxHeight: "80px",
                                              }}
                                              onError={(e) => {
                                                (
                                                  e.target as HTMLImageElement
                                                ).src =
                                                  "https://placeholder.com/200x400?text=No+Image";
                                              }}
                                            />
                                          </div>
                                          {/* Hover overlay for custom product image */}
                                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                                            <Button
                                              size="sm"
                                              variant="secondary"
                                              className="mb-1 h-6 px-2 text-xs bg-white text-blue-600 hover:bg-blue-50"
                                              onClick={() =>
                                                setShowImageGallery(item.id)
                                              }
                                            >
                                              <ImageIcon className="h-3 w-3 mr-1" />
                                              Change
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="destructive"
                                              className="h-6 px-2 text-xs"
                                              onClick={() =>
                                                removeCustomProductImage(
                                                  item.id
                                                )
                                              }
                                            >
                                              <Trash2 className="h-3 w-3 mr-1" />
                                              Remove
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    } else {
                                      // Custom product without image - Show "Add Image" option
                                      return (
                                        <div
                                          className="w-[80px] h-[106px] bg-blue-50 rounded border-2 border-dashed border-blue-300 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors -mt-10"
                                          onClick={() =>
                                            setShowImageGallery(item.id)
                                          }
                                        >
                                          <div className="text-blue-600 mb-1">
                                            <ImageIcon className="h-6 w-6" />
                                          </div>
                                          <span className="text-xs text-blue-600 font-medium text-center px-1">
                                            Add Image
                                          </span>
                                          <span className="text-[10px] text-blue-500 text-center px-1 mt-1">
                                            Click to select
                                          </span>
                                        </div>
                                      );
                                    }
                                  } else {
                                    // REGULAR PRODUCT
                                    const selectedProduct = products.find(
                                      (p) => p.id === item.productId
                                    );
                                    if (selectedProduct?.images?.length > 0) {
                                      return (
                                        <div className="relative w-[80px] h-[106px] bg-white rounded border border-blue-800 overflow-hidden -mt-10">
                                          <div className="absolute inset-0 flex items-center justify-center p-1">
                                            <img
                                              src={selectedProduct.images[0]}
                                              alt={selectedProduct.name}
                                              className="max-w-full max-h-full w-auto h-auto"
                                              style={{
                                                objectFit: "contain",
                                                width: "80px",
                                                height: "106px",
                                                maxWidth: "106px",
                                                maxHeight: "80px",
                                              }}
                                              onError={(e) => {
                                                (
                                                  e.target as HTMLImageElement
                                                ).src =
                                                  "https://placeholder.com/200x400?text=No+Image";
                                              }}
                                            />
                                          </div>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div className="w-[100px] h-[100px] bg-gray-100 rounded border border-gray-300 flex items-center justify-center -mt-10">
                                        <span className="text-xs text-gray-500">
                                          No Image
                                        </span>
                                      </div>
                                    );
                                  }
                                })()
                              ) : (
                                <div className="w-[80px] h-[100px] bg-white rounded border border-gray-300 flex items-center justify-center -mt-10">
                                  <span className="text-xs text-gray-500">
                                    Select
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* FIXED: Description Textarea - Using SINGLE function */}
                            <div className="flex-1 min-w-0">
                              <textarea
                                value={item.description || ""}
                                onChange={(e) => {
                                  const newDescription = e.target.value;

                                  // SINGLE UNIFIED FUNCTION CALL
                                  updateQuotationItemUniversal(item.id, {
                                    description: newDescription,
                                  });

                                  // Auto height adjustment
                                  const textarea = e.target;
                                  textarea.style.height = "auto";
                                  const scrollHeight = textarea.scrollHeight;
                                  const newHeight = Math.min(
                                    Math.max(scrollHeight, 65),
                                    500
                                  );

                                  // Update textarea height
                                  textarea.style.height = `${newHeight}px`;

                                  // Update state for image movement
                                  handleTextareaHeightChange(
                                    item.id,
                                    newHeight
                                  );
                                }}
                                onFocus={(e) => {
                                  const textarea = e.target;
                                  textarea.style.height = "auto";
                                  const scrollHeight = textarea.scrollHeight;
                                  const newHeight = Math.min(
                                    Math.max(scrollHeight, 65),
                                    500
                                  );
                                  textarea.style.height = `${newHeight}px`;
                                  handleTextareaHeightChange(
                                    item.id,
                                    newHeight
                                  );
                                }}
                                placeholder="Type your description here... When you select a product, its description will be appended below."
                                className="w-[896px] text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white resize-y hover:border-gray-400 overflow-y-auto leading-normal transition-all duration-200 ease-in-out"
                                style={{
                                  resize: "vertical",
                                  minHeight: "30px",
                                  maxHeight: "500px",
                                  height: `${textareaHeight}px`,
                                }}
                              />

                              <div className="text-xs text-gray-500 mt-1">
                                {item.description
                                  ? `Characters: ${item.description.length} | You can type anything - product description will be added when you select a product`
                                  : "Start typing or select a product to auto-fill"}
                              </div>
                            </div>

                            {/* SERVICES ICON - Only show when services are available but not visible */}
                            {productServices.length > 0 &&
                              !isServicesVisible && (
                                <div className="flex-shrink-0 ml-2">
                                  <button
                                    onClick={() =>
                                      toggleServicesSection(item.id)
                                    }
                                    className="flex items-center justify-center w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                                    title="Show services"
                                  >
                                    <Plus className="h-4 w-4 text-blue-700" />
                                  </button>
                                </div>
                              )}

                            {/* SERVICES SECTION - NOW BESIDE TEXTAREA */}
                            {isServicesVisible &&
                              productServices.length > 0 && (
                                <div className="max-w-[500px] flex-shrink-0">
                                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
                                    {/* SERVICES HEADER WITH TOGGLE ICON */}
                                    <div className="flex justify-between items-center mb-3">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-blue-900 text-sm">
                                          Available Services
                                        </h4>
                                        {itemServiceDetails.length > 0 && (
                                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {itemServiceDetails.length} selected
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        onClick={() =>
                                          toggleServicesSection(item.id)
                                        }
                                        className="flex items-center justify-center w-6 h-6 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                                        title="Hide services"
                                      >
                                        <Minus className="h-3 w-3 text-blue-700" />
                                      </button>
                                    </div>

                                    {item.productId &&
                                    productServices.length > 0 ? (
                                      <div className="overflow-y-auto max-h-[200px]">
                                        <div className="space-y-1">
                                          {productServices.map(
                                            (
                                              service: any,
                                              serviceIndex: number
                                            ) => (
                                              <div
                                                key={`service-${service.serviceId}-${item.id}-${serviceIndex}`}
                                                className="border border-blue-200 rounded p-1 hover:bg-blue-50 hover:border-blue-300 w-100 transition-colors bg-white"
                                              >
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2 flex-1">
                                                    <Checkbox
                                                      checked={
                                                        itemSelectedServices[
                                                          service.serviceId
                                                        ] || false
                                                      }
                                                      onCheckedChange={(
                                                        checked
                                                      ) => {
                                                        handleServiceSelection(
                                                          item.id,
                                                          service.serviceId,
                                                          service,
                                                          checked as boolean
                                                        );
                                                      }}
                                                      className="mt-0.5"
                                                    />
                                                    <div className="flex-1">
                                                      <div className="flex items-center justify-between w-full">
                                                        <span className="text-sm font-medium text-gray-800 block truncate">
                                                          {service.serviceName}
                                                        </span>
                                                        <span className="text-sm font-semibold text-blue-700 ml-2 whitespace-nowrap">
                                                          {formatAmount(
                                                            service.total ||
                                                              service.price ||
                                                              0
                                                          )}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    ) : item.productId ? (
                                      <div className="bg-gray-100 p-3 rounded border text-center">
                                        <p className="text-gray-600 text-sm">
                                          No additional services available
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-center">
                                        <p className="text-yellow-700 text-sm">
                                          Select a product to view services
                                        </p>
                                      </div>
                                    )}

                                    {itemServiceDetails.length > 0 && (
                                      <div className="mt-3 pt-3 border-t border-blue-300">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="font-semibold text-blue-900 text-sm">
                                            Selected Services:
                                          </span>
                                          <span className="font-bold text-blue-900 text-sm">
                                            {itemServiceDetails.length} service
                                            {itemServiceDetails.length !== 1
                                              ? "s"
                                              : ""}
                                          </span>
                                        </div>
                                        <div className="text-sm text-blue-800 space-y-1">
                                          <div className="flex justify-between border-t border-blue-300 pt-2 mt-2">
                                            <span className="font-semibold">
                                              Total Service Charges:
                                            </span>
                                            <span className="font-bold">
                                              {formatAmount(
                                                item.serviceCharges || 0
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
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
                    Add Item
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
            Add Item
          </Button>

          <Button
            onClick={addQuotationTitle}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Section
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

  // quotation item

  const [isTimelineScheduleVisible, setIsTimelineScheduleVisible] =
    useState(true);

  const renderTimelineSchedule = (section: QuotationSection) => {
    // Auto-resize for textareas
    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      textarea.style.height = "5px";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    return (
      <div className="space-y-1">
        {/* Timeline Schedule Header with Toggle Button */}
        <div className="flex justify-end -mb-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setIsTimelineScheduleVisible(!isTimelineScheduleVisible)
            }
            className="h-[2px] px-1 text-xs -mt-10 text-gray-500 hover:text-gray-700"
          >
            {isTimelineScheduleVisible ? "Hide ▲" : "Show ▼"}
          </Button>
        </div>

        {/* Section Content - Conditionally Rendered */}
        {isTimelineScheduleVisible ? (
          <div className="space-y-1">
            <div className="space-y-2 -mt-5">
              <Label htmlFor="timelineDetails">Project Timeline</Label>
              <Textarea
                id="timelineDetails"
                value={section.data.timelineDetails || ""}
                onChange={(e) =>
                  updateSectionData(section.id, {
                    timelineDetails: e.target.value,
                  })
                }
                onInput={handleTextareaInput}
                className="resize-none overflow-hidden min-h-[5px]"
                style={{ height: "5px", minHeight: "5px", maxHeight: "800px" }}
              />
            </div>

            <div className="space-y-4 -mb-4">
              <div className="flex items-center justify-between">
                <Label>Timeline Milestones</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newMilestones = [
                        ...(section.data.milestones || []),
                        "",
                      ];
                      updateSectionData(section.id, {
                        milestones: newMilestones,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1 -mt-2">
                {(section.data.milestones || []).map(
                  (milestone: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        value={milestone}
                        onChange={(e) => {
                          const newMilestones = [
                            ...(section.data.milestones || []),
                          ];
                          newMilestones[index] = e.target.value;
                          updateSectionData(section.id, {
                            milestones: newMilestones,
                          });
                        }}
                        placeholder={`Milestone ${index + 1}...`}
                        className="flex-1"
                      />
                      {(section.data.milestones || []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newMilestones = (
                              section.data.milestones || []
                            ).filter((_: any, i: number) => i !== index);
                            updateSectionData(section.id, {
                              milestones: newMilestones,
                            });
                          }}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500 bg-white" />
                        </Button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          // Hidden State
          <div className="h-[1px]"></div>
        )}
      </div>
    );
  };

  const [isTermsWarrantiesVisible, setIsTermsWarrantiesVisible] =
    useState(true);

  const renderTermsWarranties = (section: QuotationSection) => {
    // Auto-resize for textareas
    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      textarea.style.height = "5px";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    return (
      <div className="space-y-1">
        {/* Terms & Warranties Header with Toggle Button */}
        <div className="flex justify-end -mb-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setIsTermsWarrantiesVisible(!isTermsWarrantiesVisible)
            }
            className="h-[2px] px-1 text-xs -mt-10 text-gray-500 hover:text-gray-700"
          >
            {isTermsWarrantiesVisible ? "Hide ▲" : "Show ▼"}
          </Button>
        </div>

        {/* Section Content - Conditionally Rendered */}
        {isTermsWarrantiesVisible ? (
          <div className="space-y-1">
            <div className="space-y-2 -mt-5">
              <Label htmlFor="generalTerms">General Terms</Label>
              <Textarea
                id="generalTerms"
                value={section.data.generalTerms || ""}
                onChange={(e) =>
                  updateSectionData(section.id, {
                    generalTerms: e.target.value,
                  })
                }
                onInput={handleTextareaInput}
                className="resize-none overflow-hidden min-h-[5px]"
                placeholder="Enter general terms and conditions..."
                style={{ minHeight: "5px", maxHeight: "800px" }}
              />
            </div>

            <div className="space-y-4 -mb-4">
              <div className="flex items-center justify-between">
                <Label>Terms & Conditions</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newTerms = [...(section.data.terms || []), ""];
                      updateSectionData(section.id, { terms: newTerms });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1 -mt-2">
                {(section.data.terms || []).map(
                  (term: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        value={term}
                        onChange={(e) => {
                          const newTerms = [...(section.data.terms || [])];
                          newTerms[index] = e.target.value;
                          updateSectionData(section.id, { terms: newTerms });
                        }}
                        placeholder={`Term ${index + 1}...`}
                        className="flex-1"
                      />
                      {(section.data.terms || []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newTerms = (section.data.terms || []).filter(
                              (_: any, i: number) => i !== index
                            );
                            updateSectionData(section.id, { terms: newTerms });
                          }}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500 bg-white" />
                        </Button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          // Hidden State
          <div className="h-[1px]"></div>
        )}
      </div>
    );
  };

  const [isContactInformationVisible, setIsContactInformationVisible] =
    useState(true);

  const renderContactInformation = (section: QuotationSection) => {
    // Auto-resize for additional notes
    const handleNotesInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      textarea.style.height = "5px";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    return (
      <div className="space-y-1">
        {/* Contact Information Header with Toggle Button */}
        <div className="flex justify-end -mb-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setIsContactInformationVisible(!isContactInformationVisible)
            }
            className="h-[2px] px-1 text-xs -mt-10 text-gray-500 hover:text-gray-700"
          >
            {isContactInformationVisible ? "Hide ▲" : "Show ▼"}
          </Button>
        </div>

        {/* Section Content - Conditionally Rendered */}
        {isContactInformationVisible ? (
          <div className="space-y-6">
            {/* Professional Agreement Header */}

            {/* Contact Information - BOTH EDITABLE */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information - EDITABLE */}
                <Card className="p-4 border-blue-200">
                  <h5 className="font-medium text-blue-700 mb-4">
                    Client Information
                  </h5>
                  <div className="space-y-3">
                    {[
                      { label: "Company Name", key: "clientCompanyName" },
                      { label: "Contact Person", key: "clientContactPerson" },
                      {
                        label: "Email Address",
                        key: "clientEmail",
                        type: "email",
                      },
                      {
                        label: "Phone Number",
                        key: "clientPhone",
                        type: "tel",
                      },
                      { label: "Address", key: "clientAddress" },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label>{field.label}</Label>
                        <Input
                          type={field.type || "text"}
                          value={section.data.contactInfo?.[field.key] || ""}
                          onChange={(e) =>
                            updateSectionData(section.id, {
                              contactInfo: {
                                ...section.data.contactInfo,
                                [field.key]: e.target.value,
                              },
                            })
                          }
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="border-blue-200"
                        />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Company Information - EDITABLE */}
                <Card className="p-4 border-green-200">
                  <h5 className="font-medium text-green-700 mb-4">
                    Company Information
                  </h5>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Company Name",
                        key: "companyName",
                        placeholder: "Your Company Name",
                      },
                      {
                        label: "Contact Person",
                        key: "companyContactPerson",
                        placeholder: "John Doe",
                      },
                      {
                        label: "Email Address",
                        key: "companyEmail",
                        type: "email",
                        placeholder: "contact@company.com",
                      },
                      {
                        label: "Phone Number",
                        key: "companyPhone",
                        type: "tel",
                        placeholder: "+1 (555) 123-4567",
                      },
                      {
                        label: "Address",
                        key: "companyAddress",
                        placeholder: "123 Business St, City, Country",
                      },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label>{field.label}</Label>
                        <Input
                          type={field.type || "text"}
                          value={section.data.contactInfo?.[field.key] || ""}
                          onChange={(e) =>
                            updateSectionData(section.id, {
                              contactInfo: {
                                ...section.data.contactInfo,
                                [field.key]: e.target.value,
                              },
                            })
                          }
                          placeholder={field.placeholder}
                          className="border-green-200"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">
                  Next Steps & Action Items
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSteps = [...(section.data.nextSteps || []), ""];
                    updateSectionData(section.id, { nextSteps: newSteps });
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {(section.data.nextSteps || []).map(
                  (step: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...(section.data.nextSteps || [])];
                          newSteps[index] = e.target.value;
                          updateSectionData(section.id, {
                            nextSteps: newSteps,
                          });
                        }}
                        placeholder={`Action item ${index + 1}...`}
                        className="flex-1"
                      />
                      {(section.data.nextSteps || []).length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newSteps = (
                              section.data.nextSteps || []
                            ).filter((_: any, i: number) => i !== index);
                            updateSectionData(section.id, {
                              nextSteps: newSteps,
                            });
                          }}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Agreement Footer */}
          </div>
        ) : (
          // Hidden State
          <div className="h-[1px]"></div>
        )}
      </div>
    );
  };

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
                onClick={() =>
                  setIsProposalSectionsVisible(!isProposalSectionsVisible)
                }
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
                      className={`p-1.5 rounded-md border cursor-move transition-all flex items-center justify-between ${
                        section.enabled
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
                          className={`text-xs font-medium truncate ${
                            section.enabled ? "text-gray-800" : "text-gray-500"
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

      <Card className="mb-1 p-0 overflow-hidden">
        {/* HEADER - Minimal possible space */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-sm font-semibold leading-none">
            Basic Information
          </span>
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
                          {customer.companyName} -{" "}
                          {customer.primaryContact.name}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 ">
        {/* Main sections content with responsive width */}
        <div
          className={`lg:col-span-4 space-y-6 transition-all duration-300 ease-in-out`}
        >
          {sections
            .filter((section) => section.enabled)
            .map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between -mt-5">
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
                    {/* <Badge variant="default">PDF</Badge> */}
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



