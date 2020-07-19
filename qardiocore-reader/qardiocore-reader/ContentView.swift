//
//  ContentView.swift
//  qardiocore-reader
//
//  Created by Miran on 02/07/2020.
//  Copyright © 2020 Miran. All rights reserved.
//

import SwiftUI

struct ContentView: View {
    let appDelegate = UIApplication.shared.delegate as! AppDelegate
    
    @EnvironmentObject var data: Data
    
    var body: some View {
        VStack(spacing: 10) {
            Text("\(self.data.tickCount). synced \(self.data.sampleCount)/\(self.data.totalSampleCount) samples")
            Button(action: {
                self.data.running = !self.data.running
                
                self.data.sampleCount = 0
                self.data.totalSampleCount = 0
                
                if self.data.running {
                    self.appDelegate.syncer.start()
                } else {
                    self.appDelegate.syncer.stop()
                }
                
//                self.appDelegate.sync([ HeartRate(type: self.data.running ? .start : .end, device: "", name: UIDevice.current.name, timestamp: Int(NSDate().timeIntervalSince1970), bpm: 0) ])
            }) {
                Text(self.data.running ? "Stop" : "Start")
                .frame(width: 100, height: 100)
                .foregroundColor(Color.white)
                .background(self.data.running ? Color.red : Color.green)
                .clipShape(Circle())
            }.buttonStyle(PlainButtonStyle()).disabled(!self.data.ready)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
