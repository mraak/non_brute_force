//
//  HeartRateManager.swift
//  Heart Control
//
//  Created by Thomas Paul Mann on 01/08/16.
//  Copyright © 2016 Thomas Paul Mann. All rights reserved.
//

import Foundation
import HealthKit
import SwiftUI

typealias HKQueryUpdateHandler = ((HKAnchoredObjectQuery, [HKSample]?, [HKDeletedObject]?, HKQueryAnchor?, Error?) -> Swift.Void)

protocol HeartRateManagerDelegate: class {

    func heartRate(didChangeTo newHeartRate: HeartRate)

}

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

class SessionDelegate : NSObject, URLSessionTaskDelegate {
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        if error != nil {
            print("error: \(error!.localizedDescription).")
        }
    }
}

class HeartRateManager {

    // MARK: - Properties
    
    let formatter: ISO8601DateFormatter
    let deviceName: String

    private var session: URLSession! = nil

    private let healthStore = HKHealthStore()

    weak var delegate: HeartRateManagerDelegate?

    private var activeQueries = [HKQuery]()
    
    // MARK: - Initialization

    init() {
        formatter = ISO8601DateFormatter()
        formatter.formatOptions = [
            .withInternetDateTime,
            .withFractionalSeconds
        ]
        deviceName = WKInterfaceDevice.current().name
        
        let configuration = URLSessionConfiguration.background(withIdentifier: "reporting")
        configuration.allowsCellularAccess = true
        configuration.networkServiceType = .background
        configuration.isDiscretionary = false

        session = URLSession.init(configuration: configuration, delegate: SessionDelegate(), delegateQueue: OperationQueue.main)

        // Request authorization to read heart rate data.
        AuthorizationManager.requestAuthorization { (success) in
            // TODO: Export error.
            print(success)
        }
    }

    // MARK: - Public API

    func start() {
        self.send(.start)
        
        // Configure heart rate quantity type.
        guard let quantityType = HKObjectType.quantityType(forIdentifier: .heartRate) else { return }

        // Create query to receive continiuous heart rate samples.
        let datePredicate = HKQuery.predicateForSamples(withStart: Date(), end: nil, options: .strictStartDate)
        let devicePredicate = HKQuery.predicateForObjects(from: [HKDevice.local()])
        let queryPredicate = NSCompoundPredicate(andPredicateWithSubpredicates:[datePredicate, devicePredicate])
        let updateHandler: HKQueryUpdateHandler = { [weak self] query, samples, deletedObjects, queryAnchor, error in
            if let quantitySamples = samples as? [HKQuantitySample] {
                self?.process(samples: quantitySamples)
            }
        }
        let query = HKAnchoredObjectQuery(type: quantityType,
                                          predicate: queryPredicate,
                                          anchor: nil,
                                          limit: HKObjectQueryNoLimit,
                                          resultsHandler: updateHandler)
        query.updateHandler = updateHandler

        // Execute the heart rate query.
        healthStore.execute(query)

        // Remember all active Queries to stop them later.
        activeQueries.append(query)
    }

    func stop() {
        // Stop all active queries.
        activeQueries.forEach { healthStore.stop($0) }
        activeQueries.removeAll()
        
        self.send(.stop)
    }

    // MARK: - Process

    private func process(samples: [HKQuantitySample]) {
        // Process every single sample.
        samples.forEach { process(sample: $0) }
    }

    private func process(sample: HKQuantitySample) {
        // If sample is not a heart rate sample, then do nothing.
        if (sample.quantityType != HKObjectType.quantityType(forIdentifier: .heartRate)) {
            return
        }

        // If sample is not compatible with beats per minute, then do nothing.
        if (!sample.quantity.is(compatibleWith: HKUnit.beatsPerMinute())) {
            return
        }

        // Extract information from sample.
        let timestamp = sample.endDate
        let count = sample.quantity.doubleValue(for: .beatsPerMinute())

        // Delegate new heart rate.
        let newHeartRate = HeartRate(timestamp: timestamp, bpm: count)
        delegate?.heartRate(didChangeTo: newHeartRate)
        
        let entry = Entry(
            device: self.deviceName,
            date: formatter.string(from: timestamp),
            bpm: count
        )
        
        self.send(.entry, entry)
    }

    func send(_ type: Payload.Types, _ entry: Entry? = nil) {
        let payload = Payload(
            type: type,
            deviceName: self.deviceName,
            date: formatter.string(from: Date()),
            data: entry == nil ? nil : [entry!]
        )

        guard let encoded = try? JSONEncoder().encode(payload) else {
            print("Failed to encode payload")
            return
        }

        print("send begin \(payload)")

        let url = URL(string: "https://heartrate.miran248.vercel.app/api/payload")!
//        let url = URL(string: "http://localhost:3000/api/payload")!

        var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: 5000)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpMethod = "POST"
        request.httpBody = encoded

        self.session.dataTask(with: request).resume()

        print("send end")
    }
}
