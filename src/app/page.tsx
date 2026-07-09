import ChatWindow from '@/components/ChatWindow';
import InventoryDashboard from '@/components/InventoryDashboard';

export default function Home() {
  return (
    <main className="flex h-screen bg-gray-100 p-4 gap-4 font-sans">
      {/* Left Panel: WhatsApp-like Chat UI */}
      <section className="w-1/3 min-w-[350px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
        <header className="bg-green-600 text-white p-4 flex items-center shadow-md z-10">
          <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold mr-3">
            AI
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">Agentic Supply Chain</h1>
            <p className="text-green-100 text-xs">Online</p>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto bg-[#efeae2]">
          <ChatWindow />
        </div>
      </section>

      {/* Right Panel: Dashboard */}
      <section className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden p-6 flex flex-col">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Store Dashboard</h2>
          <p className="text-sm text-gray-500">Live Inventory & Procurement</p>
        </header>
        
        <div className="flex-1 overflow-y-auto">
          <InventoryDashboard />
        </div>
      </section>
    </main>
  );
}
