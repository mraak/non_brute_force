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
    
    let queue = DispatchQueue(label: "test-queue", attributes: .concurrent)
    let group = DispatchGroup()
    
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

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        store = HKHealthStore()
        
        if HKHealthStore.isHealthDataAvailable() {
            do {
                try requestAccess()
            } catch {
                print("Request for access failed to display to the user and was not previously displayed.")
            }
        } else {
            fatalError("The health store is not available.")
        }
        
        let configuration = URLSessionConfiguration.background(withIdentifier: "reporting")
        configuration.allowsCellularAccess = true
        configuration.networkServiceType = .background
        configuration.isDiscretionary = false
        
        session = URLSession.init(configuration: configuration, delegate: SessionDelegate(), delegateQueue: nil)
        
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
//        } else {
//            throw HKHealthStoreError.RequestForAccessNotDisplayed
//        }
    }
    
    private func successOrError(success: Bool, AuthorizationError: Error?) -> Void {
        if success {
            print("Success.")
            
            for sampleType in sampleTypes {
                group.enter()
                
                queue.async {
                    self.getSamplesFromHealthKit(for: sampleType)
                }
            }
            
    //        queue.async {
    //            if let heartRateSummaryType = self.heartRateSummaryType {
    //                self.getSummaryFromHealthKit(for: heartRateSummaryType)
    //            }
    //        }
            
            group.notify(queue: .main) {
                print("done loading")
                
                DispatchQueue.main.async {
                    self.data.ready = true
                }
            }
        } else {
            print("Failure.")
        }
        if let error = AuthorizationError {
            print(error)
        }
        
    }
    
    private func getSamplesFromHealthKit(for sampleType: HKSampleType) {
        //1. Set the SampleType to find
        //  Its a global var bodyFatPercentageSample
        
        //2. Write the query, date range, and all other options for the query
        //2a. Dates
        let endDate = Date() //now
        let startDate = Date(timeIntervalSince1970: TimeInterval(exactly: 0)!)
        
        //2b. Query Options
        let queryOptions = HKQueryOptions()
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: queryOptions)
        
        //4. Run this bitch
//        let query = HKSampleQuery(
//            sampleType: sampleType,
//            predicate: predicate,
//            limit: HKObjectQueryNoLimit,
//            sortDescriptors: nil,
//            resultsHandler: convertHealthKitSample
//        )
        
        let query = HKAnchoredObjectQuery(type: sampleType, predicate: predicate, anchor: nil, limit: HKObjectQueryNoLimit, resultsHandler: convertHealthKitSample)
        query.updateHandler = convertHealthKitSample

        self.store.execute(query)
    }
    
//    private func convertHealthKitSample(query: HKSampleQuery, samples: [HKSample]?, error: Error?) -> Void {
    private func convertHealthKitSample(query: HKAnchoredObjectQuery, samples: [HKSample]?, deletedObjects: [HKDeletedObject]?, queryAnchor: HKQueryAnchor?, error: Error?) -> Void {
        queue.async {
            if let samples = samples {
                if samples.count == 0 {
                    print("no samples found for query \(query)")
                    
                    return
                }
                
                if let samples = samples as? [HKWorkout] {
                    for sample in samples {
//                        print(sample.device?.name)
                        print(sample.debugDescription)
                    }
                }
            
                if let samples = samples as? [HKQuantitySample] {
                    DispatchQueue.main.async {
                        self.data.sampleCount += samples.count
                    }
                    
                    var entries = [HeartRate]()
                    
                    for sample in samples {
                        print("sample \(sample.device?.name! ?? "unknown device") \(sample.startDate) \(sample.endDate) \(sample.count) \(sample.quantity) \(sample.quantityType.identifier) \(sample.sampleType.identifier)")

                        // If sample is not compatible with beats per minute, then do nothing.
                        if (!sample.quantity.is(compatibleWith: HKUnit.beatsPerMinute())) {
                            return
                        }

                        // Extract information from sample.
                        
                        let timestamp = Double(sample.endDate.timeIntervalSince1970)
                        let count = sample.quantity.doubleValue(for: .beatsPerMinute())

                        // Delegate new heart rate.
                        let entry = HeartRate(type: .entry, device: sample.device?.name! ?? "unknown device", name: UIDevice.current.name, timestamp: Int(timestamp), bpm: count)
                        entries.append(entry)
                        
        //                let quantity = sample.quantity
        //                var bodyFatSamples: [BodyFatPercentageSample]? = nil
        //                var bodyMassSamples: [BodyMassSample]? = nil
        //                if quantity.is(compatibleWith: HKUnit.percent()) {
        //                    //is body fat percentage
        //                    let value = quantity.doubleValue(for: HKUnit.percent())
        //                    let date = sample.endDate
        //                    let bodyFat = BodyFatPercentageSample(date: date, value: value)
        //                    bodyFatSamples?.insert(bodyFat, at: 0)
        //                } else {
        //                    //is body mass
        //                    let value = quantity.doubleValue(for: self.hkUnitOfMeasurement)
        //                    let date = sample.endDate
        //                    let bodyMass = BodyMassSample(date: date, value: value, unit: self.perferredUnitOfMeasurement)
        //                    bodyMassSamples?.insert(bodyMass, at: 0)
        //                }
                    }

                    self.sync(entries)
                }
            } else {
                print("query not available \(query) \(error?.localizedDescription)")
            }
            
            self.group.leave()
        }
    }
        
    private func getSummaryFromHealthKit(for summaryType: HKActivitySummaryType) {
        //1. Set the SampleType to find
        //  Its a global var bodyFatPercentageSample
        
        //2. Write the query, date range, and all other options for the query
        //2a. Dates
        let endDate = Date() //now
        let startDate = Date(timeIntervalSince1970: TimeInterval(exactly: 0)!)
        
        //2b. Query Options
        let queryOptions = HKQueryOptions()
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: queryOptions)
        
        //4. Run this bitch
        let query = HKActivitySummaryQuery(
            predicate: predicate,
            resultsHandler: convertHealthKitSummary
        )
        self.store.execute(query)
    }
    private func convertHealthKitSummary(query: HKActivitySummaryQuery, activities: [HKActivitySummary]?, error: Error?) -> Void {
        queue.async {
            self.group.enter()
            guard let activities = activities else {
                fatalError("Failed to downcast health kit samples to hk quantity samples")
            }
            for activity in activities {
                print("activity \(activity)")
//                let quantity = sample.quantity
//                var bodyFatSamples: [BodyFatPercentageSample]? = nil
//                var bodyMassSamples: [BodyMassSample]? = nil
//                if quantity.is(compatibleWith: HKUnit.percent()) {
//                    //is body fat percentage
//                    let value = quantity.doubleValue(for: HKUnit.percent())
//                    let date = sample.endDate
//                    let bodyFat = BodyFatPercentageSample(date: date, value: value)
//                    bodyFatSamples?.insert(bodyFat, at: 0)
//                } else {
//                    //is body mass
//                    let value = quantity.doubleValue(for: self.hkUnitOfMeasurement)
//                    let date = sample.endDate
//                    let bodyMass = BodyMassSample(date: date, value: value, unit: self.perferredUnitOfMeasurement)
//                    bodyMassSamples?.insert(bodyMass, at: 0)
//                }
            }
        }
    }
    
    public func sync(_ entries: [HeartRate]) {
        guard let encoded = try? JSONEncoder().encode(entries) else {
            print("Failed to encode heart rate")
            return
        }

        let url = URL(string: "https://heartrate.miran248.now.sh/api/sync")!
//        let url = URL(string: "http://localhost:3000/api/sync")!
        var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: 500)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpMethod = "POST"
        request.httpBody = encoded
        
        session.dataTask(with: request).resume()
//        session.uploadTask(with: request, from: encoded).resume()
        
        print("synced \(entries)")
    }
    
    func applicationWillTerminate(_ application: UIApplication) {
        print("applicationWillTerminate")
        
//        manager.stopObserving()
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

