//
//  AppDelegate.swift
//  qardiocore-reader
//
//  Created by Miran on 02/07/2020.
//  Copyright © 2020 Miran. All rights reserved.
//

import UIKit
import HealthKit
import SwiftUI

class SessionDelegate : NSObject, URLSessionTaskDelegate {
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        if error != nil {
            print("error: \(error!.localizedDescription).")
        }
    }
}

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    let queue = DispatchQueue(label: "tasks")
    let group = DispatchGroup()

    var activeQueries = [HKQuery]()

    var store : HKHealthStore!

    let sampleTypes = [
//        HKWorkoutType.workoutType(),
        HKWorkoutType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRate)!,
//        HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.heartRate)!,
//        HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.respiratoryRate)!,
//        HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.restingHeartRate)!,
//        HKObjectType.quantityType(forIdentifier: HKQuantityTypeIdentifier.stepCount)!,
    ]

    var heartRateSummaryType: HKActivitySummaryType? = HKObjectType.activitySummaryType()

    private var session: URLSession! = nil

    public var data = Data()
    
    public var syncer: Syncer!

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        let configuration = URLSessionConfiguration.background(withIdentifier: "reporting")
        configuration.allowsCellularAccess = true
        configuration.networkServiceType = .background
        configuration.isDiscretionary = false

        session = URLSession.init(configuration: configuration, delegate: SessionDelegate(), delegateQueue: OperationQueue.main)

        store = HKHealthStore()
        
        syncer = Syncer(session, store, data)
        
        if HKHealthStore.isHealthDataAvailable() {
            do {
                try requestAccess()
            } catch {
                print("Request for access failed to display to the user and was not previously displayed.")
            }
        } else {
            fatalError("The health store is not available.")
        }

        return true
    }

    enum HKHealthStoreError: Error {
        case HealthDataNotAvailable
        case RequestForAccessNotDisplayed
    }

    //MARK: - Private Functions
    private func requestAccess() throws {
        let dataTypesToRead: Set = Set(sampleTypes)

        // Request auth
        store.requestAuthorization(toShare: [], read: dataTypesToRead, completion: successOrError)
    }

    private func successOrError(success: Bool, AuthorizationError: Error?) -> Void {
        if success {
            print("Success.")

//            for sampleType in sampleTypes {
//                group.enter()
//
//                queue.async {
//                    self.getSamplesFromHealthKit(for: sampleType)
//                }
//            }

//            group.notify(queue: .main) {
//                print("done loading")
//
//                DispatchQueue.main.async {
                    self.data.ready = true
//                }
//            }
        } else {
            print("Failure.")
        }
        if let error = AuthorizationError {
            print(error)
        }

    }

//    private func getSamplesFromHealthKit(for sampleType: HKSampleType) {
//        //1. Set the SampleType to find
//        //  Its a global var bodyFatPercentageSample
//
//        //2. Write the query, date range, and all other options for the query
//        //2a. Dates
////        let startDate = Date(timeIntervalSince1970: TimeInterval(exactly: 0)!)
//
//        //2b. Query Options
////        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: nil)
//
//        //4. Run this bitch
//        let query = HKAnchoredObjectQuery(
//            type: sampleType,
//            predicate: nil,
//            anchor: nil,
//            limit: HKObjectQueryNoLimit,
//            resultsHandler: convertHealthKitSample
//        )
//        query.updateHandler = convertHealthKitSample
//
//        self.store.execute(query)
//        
//        self.store.enableBackgroundDelivery(
//            for: sampleType,
//            frequency: .immediate,
//            withCompletion: {(status: Bool, error: Error?) -> Void in
//                print("status \(status) error \(error?.localizedDescription)")
//            }
//        )
//
//        activeQueries.append(query)
//    }

//    private func convertHealthKitSample(query: HKAnchoredObjectQuery, samples: [HKSample]?, deletedObjects: [HKDeletedObject]?, queryAnchor: HKQueryAnchor?, error: Error?) -> Void {
//        queue.async {
//            if let samples = samples {
//                if samples.count == 0 {
//                    print("no samples found for query \(query)")
//
//                    return
//                }
//
//                if let samples = samples as? [HKWorkout] {
//                    for sample in samples {
//                        print(sample.debugDescription)
//                    }
//                }
//
//                if let samples = samples as? [HKQuantitySample] {
//                    DispatchQueue.main.async {
//                        self.data.sampleCount += samples.count
//                    }
//
//                    var entries = [HeartRate]()
//
//                    for sample in samples {
//                        syncer.sample(sample)
//                        print("sample \(UIDevice.current.name) \(sample.device?.name! ?? "unknown device") \(sample.startDate) \(sample.endDate) \(sample.count) \(sample.quantity) \(sample.quantityType.identifier) \(sample.sampleType.identifier)")
//
//                        // If sample is not compatible with beats per minute, then do nothing.
////                        if (!sample.quantity.is(compatibleWith: HKUnit.beatsPerMinute())) {
////                            return
////                        }
//
//                        // Extract information from sample.
//
//                        let timestamp = Double(sample.endDate.timeIntervalSince1970)
//                        let count = sample.quantity.doubleValue(for: .beatsPerMinute())
//
//                        // Delegate new heart rate.
//                        let entry = HeartRate(type: .entry, device: sample.device?.name! ?? "unknown device", name: UIDevice.current.name, timestamp: Int(timestamp), bpm: count)
//                        entries.append(entry)
//
//                        if entries.count % 50 == 0 {
//                            self.sync(entries)
//                            entries = []
//                        }
//                    }
//
//                    self.sync(entries)
//                }
//            } else {
//                print("query not available \(query) \(error?.localizedDescription)")
//            }
//
//            if !self.data.ready {
//                self.queue.async {
//                    self.group.leave()
//                }
//            }
//        }
//    }

//    public func sync(_ entries: [HeartRate]) {
//        self.queue.async {
//            if entries.count == 0 {
//                return
//            }
//
//            guard let encoded = try? JSONEncoder().encode(entries) else {
//                print("Failed to encode heart rate")
//                return
//            }
//
//            print("sync begin")
//
//            let url = URL(string: "https://heartrate.miran248.now.sh/api/sync")!
//    //        let url = URL(string: "http://localhost:3000/api/sync")!
//            var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: 60000)
//            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
//            request.httpMethod = "POST"
//            request.httpBody = encoded
//
//            self.session.dataTask(with: request).resume()
//
//            DispatchQueue.main.async {
//                self.data.syncedSampleCount += entries.count
//            }
//
//            print("sync end \(entries)")
//        }
//    }

    func applicationWillTerminate(_ application: UIApplication) {
        print("applicationWillTerminate")

        activeQueries.forEach { store.stop($0) }
        activeQueries.removeAll()
    }

    // MARK: UISceneSession Lifecycle

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        // Called when a new scene session is being created.
        // Use this method to select a configuration to create the new scene with.
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // Called when the user discards a scene session.
        // If any sessions were discarded while the application was not running, this will be called shortly after application:didFinishLaunchingWithOptions.
        // Use this method to release any resources that were specific to the discarded scenes, as they will not return.
    }
}
