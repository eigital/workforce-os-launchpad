import AIAssistant from "@/components/ai/AIAssistant";

export default function Help() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Help & Support</h1>
        <p className="text-muted-foreground">
          Ask our AI assistant anything about the platform, or get guidance on setup and features.
        </p>
      </div>
      
      <div className="h-[calc(100vh-12rem)]">
        <AIAssistant embedded />
      </div>
    </div>
  );
}