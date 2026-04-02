import TerminalWindow from "@/components/ui/TerminalWindow";
import CopyButton from "@/components/ui/CopyButton";

export default function TerminalShowcase() {
  return (
    <section className="relative px-6 py-20 bg-gradient-to-b from-transparent via-[#0a1628] to-transparent">
      <div className="max-w-3xl mx-auto">
        <TerminalWindow title="coffee-cli">
          <div className="space-y-2 text-[13px]">
            <div className="text-slate-500 mb-3">
              # Or install the CLI for power-user features
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-slate-500">$</span>{" "}
                <span className="text-cyan-300">npm</span>{" "}
                <span className="text-white">install -g coffee-cli</span>
              </div>
              <CopyButton text="npm install -g coffee-cli" />
            </div>
            <div className="text-slate-500 pl-2">added 42 packages in 3s</div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <div>
                <span className="text-slate-500">$</span>{" "}
                <span className="text-cyan-300">coffee</span>{" "}
                <span className="text-white">shops</span>
              </div>
              <CopyButton text="coffee shops" />
            </div>
            <div className="mt-2 pl-2 text-slate-300">
              <div className="text-slate-500 text-xs mb-1">
                NAME&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                DISTANCE&nbsp;&nbsp;&nbsp;STATUS
              </div>
              <div className="text-slate-600 text-xs mb-1">
                &#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;
              </div>
              <div>
                Brew &amp; Code&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 50m
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-green-400">&#9679; open</span>
              </div>
              <div>
                The Daily Grind&nbsp;&nbsp;&nbsp; 120m
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-green-400">&#9679; open</span>
              </div>
              <div>
                Kernel Kafe&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 180m
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-yellow-400">&#9679; busy</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <div>
                <span className="text-slate-500">$</span>{" "}
                <span className="text-cyan-300">coffee</span>{" "}
                <span className="text-white">order</span>{" "}
                <span className="text-slate-500">--json</span>
              </div>
              <CopyButton text="coffee order --json" />
            </div>
            <div className="pl-2 text-slate-400">
              <div>{"{"}</div>
              <div>
                &nbsp;&nbsp;
                <span className="text-blue-400">{'"order_id"'}</span>:{" "}
                <span className="text-cyan-200">{'"#TC-042"'}</span>,
              </div>
              <div>
                &nbsp;&nbsp;
                <span className="text-blue-400">{'"status"'}</span>:{" "}
                <span className="text-green-400">{'"accepted"'}</span>,
              </div>
              <div>
                &nbsp;&nbsp;
                <span className="text-blue-400">{'"eta"'}</span>:{" "}
                <span className="text-cyan-200">{'"4 min"'}</span>
              </div>
              <div>{"}"}</div>
            </div>
          </div>
        </TerminalWindow>
        <p className="text-center text-slate-500 text-sm mt-4">
          Pipe it. Script it. Alias it. It&apos;s just a CLI.
        </p>
      </div>
    </section>
  );
}
