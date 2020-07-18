//
//  Syncer.swift
//  qardiocore-reader
//
//  Created by Miran on 18/07/2020.
//  Copyright © 2020 Miran. All rights reserved.
//

import Foundation
import HealthKit
import SwiftUI

struct Entry : Encodable {
    let device: String
    let date: String
    let bpm: Double
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(device, forKey: .device)
        try container.encode(date, forKey: .date)
        try container.encode(bpm, forKey: .bpm)
    }
    
    enum CodingKeys: String, CodingKey {
        case device = "device"
        case date = "date"
        case bpm = "bpm"
    }
}

struct Payload : Encodable {
    let type: Types
    let deviceName: String
    let date: String
    let data: [Entry]?
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(type.rawValue, forKey: .type)
        try container.encode(deviceName, forKey: .deviceName)
        try container.encode(date, forKey: .date)
        try container.encode(data, forKey: .data)
    }
    
    public enum Types: String {
        case entry = "entry"
        case start = "start"
        case stop = "stop"
    }
    
    enum CodingKeys: String, CodingKey {
        case type = "type"
        case deviceName = "deviceName"
        case date = "date"
        case data = "data"
    }
}

class Syncer {
    let session: URLSession
    let store: HKHealthStore
    let data: Data
    
    let formatter: ISO8601DateFormatter
    let deviceName: String
    
    let timerInterval = 30.0
    var timer: Timer?
    var timerRunning: Bool = false
    
    var entries: [Entry]?
    
    init(_ session: URLSession, _ store: HKHealthStore, _ data: Data) {
        self.session = session
        self.store = store
        self.data = data
        
        formatter = ISO8601DateFormatter()
        deviceName = UIDevice.current.name
    }
    
    public func start() {
        self.send(.start)
        
        self.setTimerRunning(true)
    }
    public func stop() {
        self.setTimerRunning(false)
        
        self.send(.stop)
    }
    
    var tickCount = 0
    func setTimerRunning(_ running: Bool) {
        timerRunning = running
        
        if let timer = timer {
            timer.invalidate()
            self.timer = nil
        }
        
        if running {
            tickCount = 0
            
            timer = Timer.scheduledTimer(withTimeInterval: timerInterval, repeats: true, block: { timer in
                self.tickCount += 1
                
                print("tick count \(self.tickCount)")
                
                let sampleType = HKWorkoutType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRate)!
                
                let predicate = HKQuery.predicateForSamples(withStart: Date() - self.timerInterval, end: nil, options: .strictStartDate)
        
                let query = HKSampleQuery(
                    sampleType: sampleType,
                    predicate: predicate,
                    limit: HKObjectQueryNoLimit,
                    sortDescriptors: nil,
                    resultsHandler: self.process
                )
        
                self.store.execute(query)
            })
        }
    }
    func process(query: HKSampleQuery, samples: [HKSample]?, error: Error?) -> Void {
        if let samples = samples {
            DispatchQueue.main.async {
                self.data.sampleCount += samples.count
            }
            
            if samples.count == 0 {
                print("no samples found for query \(query)")
            } else if let samples = samples as? [HKQuantitySample] {
                var entries = [Entry]()

                for sample in samples {
                    print("sample \(UIDevice.current.name) \(sample.device?.name! ?? "unknown device") \(sample.startDate) \(sample.endDate) \(sample.count) \(sample.quantity) \(sample.quantityType.identifier) \(sample.sampleType.identifier)")

                    // If sample is not compatible with beats per minute, then do nothing.
//                    if (!sample.quantity.is(compatibleWith: HKUnit.beatsPerMinute())) {
//                        return
//                    }

                    // Extract information from sample.

                    let count = sample.quantity.doubleValue(for: .beatsPerMinute())

                    // Delegate new heart rate.
                    let entry = Entry(
                        device: sample.device?.name! ?? "unknown device",
                        date: formatter.string(from: sample.endDate),
                        bpm: count
                    )
                    entries.append(entry)
                }

                self.entries = entries
            }
            
            self.send(.entry, self.entries)
        } else {
            print("query not available \(query) \(error?.localizedDescription)")
        }
    }
    
    func send(_ type: Payload.Types, _ data: [Entry]? = nil) {
        let payload = Payload(
            type: type,
            deviceName: self.deviceName,
            date: formatter.string(from: Date()),
            data: data
        )
        
        guard let encoded = try? JSONEncoder().encode(payload) else {
            print("Failed to encode payload")
            return
        }
        
        print("send begin \(payload)")

        let url = URL(string: "https://heartrate.miran248.now.sh/api/payload")!
//        let url = URL(string: "http://localhost:3000/api/payload")!

        var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: 60000)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpMethod = "POST"
        request.httpBody = encoded

        self.session.dataTask(with: request).resume()

        print("send end")
    }
}
