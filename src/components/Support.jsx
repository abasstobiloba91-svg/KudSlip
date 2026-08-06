import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

function SupportDashboard({ user, showToast }) {
  if (user?.role === 'admin' || user?.role === 'support') {
    return <AdminSupportInbox user={user} showToast={showToast} />;
  }
  return <VendorChat user={user} showToast={showToast} />;
}

function VendorChat({ user, showToast }) {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSupportTyping, setIsSupportTyping] = useState(false);
  const chatEndRef = useRef(null);
  const typingRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    // 1. Listen for Database Messages
    const msgChannel = supabase.channel('vendor_realtime_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `vendor_id=eq.${user?.id}` }, (payload) => {
        setHistory(prev => {
          if (prev.find(msg => msg.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        setIsSupportTyping(false);
      }).subscribe();

    // 2. Listen for 'Typing' Broadcasts
    const typeChannel = supabase.channel(`typing_${user?.id}`, { config: { broadcast: { ack: false } } })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.sender === 'support') {
          setIsSupportTyping(true);
          clearTimeout(typingRef.current);
          typingRef.current = setTimeout(() => setIsSupportTyping(false), 2000);
        }
      }).subscribe();

    return () => { supabase.removeChannel(msgChannel); supabase.removeChannel(typeChannel); };
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, isSupportTyping]);

  const fetchMessages = async () => {
    if (!supabase || !user?.id) return;
    const { data } = await supabase.from('support_messages').select('*').eq('vendor_id', user.id).order('created_at', { ascending: true });
    if (data) setHistory(data);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!message.trim() || !user?.id) return;
    const tempMessage = message;
    setMessage(""); 
    
    await supabase.from('notifications').insert([{ user_id: 'SYSTEM_ADMIN', message: `Ticket Update: ${user.business_name || "Merchant"} sent a new message.`, is_read: false }]);
    const { error } = await supabase.from('support_messages').insert([{ vendor_id: user.id, sender: 'user', message: tempMessage }]);
    if (error) { showToast("Error", error.message, "error"); setMessage(tempMessage); }
    else { fetchMessages(); }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (user?.id) {
      supabase.channel(`typing_${user.id}`).send({ type: 'broadcast', event: 'typing', payload: { sender: 'user' } });
    }
  };

  const handleReopen = async () => {
    if (!user?.id) return;
    await supabase.from('support_messages').insert([{ vendor_id: user.id, sender: 'system', message: 'TICKET_REOPENED' }]);
    await supabase.from('notifications').insert([{ user_id: 'SYSTEM_ADMIN', message: `⚠️ ${user.business_name || "Merchant"} REOPENED their support ticket.`, is_read: false }]);
    fetchMessages();
    showToast("Ticket Reopened", "Support has been notified.", "info");
  };

  const isClosed = history.length > 0 && history[history.length - 1].message === 'TICKET_CLOSED';
  const ticketId = user?.id ? user.id.substring(0, 6).toUpperCase() : "000000";

  return (
    <div style={{ maxWidth: "800px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Support Portal</div>
      <div style={{ color: "#64748B", marginBottom: "24px", fontSize: "15px" }}>Manage your secure ticket with KudiSlip engineers.</div>
      
      <div style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", flex: 1, minHeight: "500px", overflow: "hidden" }}>
         <div style={{ padding: "16px 24px", borderBottom: "1px solid #000000", background: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: "900", fontSize: "16px", color: "#000000", textTransform: "uppercase", letterSpacing: "1px" }}>Ticket #TKT-{ticketId}</div>
            <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", background: isClosed ? "#F1F5F9" : "#000000", color: isClosed ? "#64748B" : "#FFFFFF" }}>{isClosed ? "CLOSED" : "OPEN"}</span>
         </div>

         <div style={{ flex: 1, padding: "24px", overflowY: "auto", background: "#F8FAFC", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ alignSelf: "flex-start", background: "#FFFFFF", border: "1px solid #E2E8F0", padding: "16px", borderRadius: "0 16px 16px 16px", maxWidth: "80%", fontSize: "14px", color: "#000000", lineHeight: "1.6" }}>
              <strong>KudiSlip Support</strong><br/>Hello {user?.business_name || "there"}! Please describe the issue you are facing and an engineer will review it shortly.
            </div>
            
            {loading && <div style={{ textAlign: "center", color: "#64748B", fontSize: "12px" }}>Loading ticket data...</div>}
            
            {history.map((msg) => {
              if (msg.sender === 'system') {
                let txt = msg.message;
                if (txt === 'TICKET_CLOSED') txt = 'Admin has marked this ticket as CLOSED.';
                if (txt === 'TICKET_REOPENED') txt = 'Ticket REOPENED by user.';
                return <div key={msg.id} style={{ textAlign: "center", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", margin: "16px 0", letterSpacing: "1px" }}>— {txt} —</div>;
              }
              const isMe = msg.sender === 'user';
              return (
                <div key={msg.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", background: isMe ? "#000000" : "#FFFFFF", border: isMe ? "none" : "1px solid #E2E8F0", color: isMe ? "#FFFFFF" : "#000000", padding: "14px 18px", borderRadius: isMe ? "16px 16px 0 16px" : "16px 16px 16px 0", maxWidth: "80%", fontSize: "14px", lineHeight: "1.6", wordBreak: "break-word" }}>
                  {!isMe && <div style={{ fontWeight: "800", fontSize: "11px", marginBottom: "4px", color: "#64748B" }}>KudiSlip Support</div>}
                  {msg.message}
                </div>
              );
            })}
            
            {isSupportTyping && (
              <div style={{ alignSelf: "flex-start", background: "#FFFFFF", border: "1px solid #E2E8F0", padding: "12px 18px", borderRadius: "0 16px 16px 16px", fontSize: "14px", color: "#64748B", fontStyle: "italic" }}>
                KudiSlip Support is typing...
              </div>
            )}
            <div ref={chatEndRef} />
         </div>

         {isClosed ? (
           <div style={{ padding: "24px", borderTop: "1px solid #E2E8F0", background: "#FFFFFF", textAlign: "center" }}>
             <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "12px" }}>This issue was marked as resolved. Need more help?</p>
             <button className="btn-secondary btn-hover" onClick={handleReopen}>Reopen Ticket</button>
           </div>
         ) : (
           <div style={{ padding: "16px", borderTop: "1px solid #E2E8F0", display: "flex", gap: "12px", background: "#FFFFFF" }}>
              <input className="form-input" style={{ flex: 1, margin: 0, background: "#F1F5F9", border: "none" }} placeholder="Type your reply..." value={message} onChange={handleTyping} onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <button className="btn-primary btn-hover" onClick={handleSend}>Submit</button>
           </div>
         )}
      </div>
    </div>
  );
}

function AdminSupportInbox({ user, showToast }) {
  const [messages, setMessages] = useState([]);
  const [vendors, setVendors] = useState({});
  const [activeVendorId, setActiveVendorId] = useState(null);
  const [reply, setReply] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const chatEndRef = useRef(null);
  const typingRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    fetchData();
    const channel = supabase.channel('admin_realtime_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, () => { fetchData(); })
      .subscribe();
    return () => { window.removeEventListener('resize', handleResize); supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!activeVendorId) return;
    setIsUserTyping(false);
    const typeChannel = supabase.channel(`typing_${activeVendorId}`, { config: { broadcast: { ack: false } } })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.sender === 'user') {
          setIsUserTyping(true);
          clearTimeout(typingRef.current);
          typingRef.current = setTimeout(() => setIsUserTyping(false), 2000);
        }
      }).subscribe();

    return () => supabase.removeChannel(typeChannel);
  }, [activeVendorId]);

  const fetchData = async () => {
    if (!supabase) return;
    const [msgRes, venRes] = await Promise.all([
      supabase.from('support_messages').select('*').order('created_at', { ascending: true }),
      supabase.from('vendors').select('id, business_name, email')
    ]);
    
    if (venRes.error) {
       showToast("Vendor Fetch Error", venRes.error.message, "error");
       console.error("Vendor fetch failed:", venRes.error);
    }

    if (msgRes.data) {
      setMessages(msgRes.data);
      setIsUserTyping(false); 
    }
    if (venRes.data) {
      const vMap = {};
      venRes.data.forEach(v => vMap[v.id] = v);
      setVendors(vMap);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !activeVendorId) return;
    const temp = reply; setReply(""); 
    
    await supabase.from('notifications').insert([{ user_id: activeVendorId, message: `Support replied to your ticket.`, is_read: false }]);
    const { error } = await supabase.from('support_messages').insert([{ vendor_id: activeVendorId, sender: 'support', message: temp }]);
    if (error) { showToast("Error", error.message, "error"); setReply(temp); } else { fetchData(); }
  };

  const handleTyping = (e) => {
    setReply(e.target.value);
    if (activeVendorId) {
      supabase.channel(`typing_${activeVendorId}`).send({ type: 'broadcast', event: 'typing', payload: { sender: 'support' } });
    }
  };

  const handleCloseTicket = async () => {
    if (!activeVendorId) return;
    await supabase.from('support_messages').insert([{ vendor_id: activeVendorId, sender: 'system', message: 'TICKET_CLOSED' }]);
    await supabase.from('notifications').insert([{ user_id: activeVendorId, message: `Your support ticket has been closed by an admin.`, is_read: false }]);
    fetchData();
    showToast("Ticket Closed", "The conversation is locked.", "success");
  };

  const conversations = {};
  messages.forEach(m => {
    if (!conversations[m.vendor_id]) conversations[m.vendor_id] = [];
    conversations[m.vendor_id].push(m);
  });

  const uniqueVendorIds = Object.keys(conversations);
  const activeChat = activeVendorId ? conversations[activeVendorId] : [];
  const isClosed = activeChat.length > 0 && activeChat[activeChat.length - 1].message === 'TICKET_CLOSED';
  const activeVendorName = vendors[activeVendorId]?.business_name || vendors[activeVendorId]?.email || "Vendor";

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeChat, isUserTyping]);

  const showList = !isMobile || !activeVendorId;
  const showChat = !isMobile || activeVendorId;

  return (
    <div style={{ maxWidth: "1000px", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      {!activeVendorId || !isMobile ? (
        <>
          <div style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>Support Inbox</div>
          <div style={{ color: "#64748B", marginBottom: "24px", fontSize: "15px" }}>Manage and reply to all active vendor tickets.</div>
        </>
      ) : null}
      
      <div style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", flex: 1, overflow: "hidden", flexDirection: isMobile ? "column" : "row" }}>
         {showList && (
           <div style={{ width: isMobile ? "100%" : "280px", borderRight: isMobile ? "none" : "1px solid #E2E8F0", background: "#F8FAFC", overflowY: "auto", flex: isMobile ? 1 : "none" }}>
              {uniqueVendorIds.map(vid => {
                const v = vendors[vid] || {};
                const isActive = activeVendorId === vid;
                const convo = conversations[vid];
                const convoClosed = convo[convo.length - 1].message === 'TICKET_CLOSED';
                return (
                  <div key={vid} onClick={() => setActiveVendorId(vid)} className="card-hover" style={{ padding: "16px", borderBottom: "1px solid #E2E8F0", cursor: "pointer", background: isActive ? "#EFF6FF" : "transparent", borderLeft: isActive ? "4px solid #000000" : "4px solid transparent", opacity: convoClosed ? 0.6 : 1 }}>
                    <div style={{ fontWeight: "900", color: "#000000", fontSize: "14px", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.business_name || v.email || "Unknown Vendor"}</div>
                    <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>{convoClosed ? "🔒 Closed" : "Active Ticket"}</div>
                  </div>
                );
              })}
           </div>
         )}

         {showChat && (
           <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FFFFFF", height: "100%" }}>
              {activeVendorId ? (
                <>
                  <div style={{ padding: "16px 24px", borderBottom: "1px solid #E2E8F0", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "900", color: "#000000" }}>
                      {isMobile && <button onClick={() => setActiveVendorId(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#000000" }}>&larr;</button>}
                      <span>{activeVendorName}</span>
                    </div>
                    {!isClosed && <button onClick={handleCloseTicket} style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", cursor: "pointer", textTransform: "uppercase" }}>Close Ticket</button>}
                  </div>
                  
                  <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {activeChat.map((msg) => {
                      if (msg.sender === 'system') return <div key={msg.id} style={{ textAlign: "center", fontSize: "11px", fontWeight: "800", color: "#64748B", margin: "16px 0", letterSpacing: "1px", textTransform: "uppercase" }}>— {msg.message} —</div>;
                      const isSupport = msg.sender === 'support';
                      return (
                        <div key={msg.id} style={{ alignSelf: isSupport ? "flex-end" : "flex-start", background: isSupport ? "#000000" : "#F1F5F9", color: isSupport ? "#FFFFFF" : "#000000", padding: "12px 16px", borderRadius: isSupport ? "16px 16px 0 16px" : "16px 16px 16px 0", maxWidth: "80%", fontSize: "14px", lineHeight: "1.5" }}>
                          {msg.message}
                        </div>
                      );
                    })}
                    
                    {isUserTyping && (
                      <div style={{ alignSelf: "flex-start", background: "#F1F5F9", padding: "10px 16px", borderRadius: "16px 16px 16px 0", fontSize: "13px", color: "#64748B", fontStyle: "italic" }}>
                        {activeVendorName} is typing...
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {!isClosed && (
                    <div style={{ padding: "16px", borderTop: "1px solid #E2E8F0", display: "flex", gap: "12px" }}>
                      <input className="form-input" style={{ flex: 1, margin: 0 }} placeholder={`Reply to ${activeVendorName}...`} value={reply} onChange={handleTyping} onKeyDown={e => e.key === 'Enter' && handleReply()} />
                      <button className="btn-primary btn-hover" onClick={handleReply}>Send</button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: "14px", fontWeight: "600" }}>Select a ticket from the left to start replying.</div>
              )}
           </div>
         )}
      </div>
    </div>
  );
}

export default SupportDashboard;
